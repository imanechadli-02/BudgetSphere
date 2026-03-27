import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../core/services/transaction.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { Transaction } from '../../core/models/models';

const CATEGORY_LABELS: Record<string, string> = {
  SALARY: 'Salaire', FOOD: 'Alimentation', TRANSPORT: 'Transport',
  HEALTH: 'Santé', ENTERTAINMENT: 'Loisirs', EDUCATION: 'Éducation',
  SHOPPING: 'Shopping', HOUSING: 'Logement', SAVINGS: 'Épargne', OTHER: 'Autre'
};
const CATEGORY_ICONS: Record<string, string> = {
  SALARY: '💰', FOOD: '🛒', TRANSPORT: '🚗', HEALTH: '💊',
  ENTERTAINMENT: '🎬', EDUCATION: '📚', SHOPPING: '🛍️', HOUSING: '🏠',
  SAVINGS: '🏦', OTHER: '📦'
};

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  styles: [`
    .card { background:#1e293b; border:1px solid #334155; border-radius:16px; }
    .input-field { background:#0f172a; border:1px solid #334155; color:#f1f5f9; border-radius:12px; padding:10px 16px; font-size:14px; width:100%; }
    .input-field:focus { outline:none; border-color:#6366f1; }
    .input-field option { background:#1e293b; }
  `],
  templateUrl: './transactions.component.html'
})
export class TransactionsComponent implements OnInit {
  private txService = inject(TransactionService);
  private cdr = inject(ChangeDetectorRef);

  pagedTransactions: Transaction[] = [];
  loading = false;
  saving = false;
  showModal = false;
  editId: number | null = null;
  formError = '';
  filterType = '';
  dateFrom = '';
  dateTo = '';
  currentPage = 1;
  totalPages = 1;
  totalElements = 0;
  pages: number[] = [];
  readonly PAGE_SIZE = 8;
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;

  form = { description: '', amount: null as any, type: 'EXPENSE', category: 'FOOD', date: '', recurring: false };
  categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  ngOnInit() { this.loadStats(); this.loadPage(); }

  loadStats() {
    this.txService.getStats().subscribe(s => {
      this.totalIncome = s.totalIncome;
      this.totalExpense = s.totalExpense;
      this.balance = s.balance;
      this.cdr.detectChanges();
    });
  }

  load() { this.loadStats(); this.loadPage(); }

  loadPage() {
    this.loading = true;
    this.txService.getAll(this.currentPage - 1, this.PAGE_SIZE, this.filterType || undefined, undefined, this.dateFrom || undefined, this.dateTo || undefined).subscribe({
      next: res => {
        this.pagedTransactions = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages || Math.ceil(res.totalElements / this.PAGE_SIZE) || 1;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  applyFilters() { this.currentPage = 1; this.loadPage(); }

  resetFilters() { this.filterType = ''; this.dateFrom = ''; this.dateTo = ''; this.applyFilters(); }

  goPage(p: number) { this.currentPage = p; this.loadPage(); }

  openModal() {
    this.editId = null; this.formError = '';
    this.form = { description: '', amount: null, type: 'EXPENSE', category: 'FOOD', date: new Date().toISOString().split('T')[0], recurring: false };
    this.showModal = true;
  }

  editTx(tx: Transaction) {
    this.editId = tx.id; this.formError = '';
    this.form = { description: tx.description, amount: tx.amount, type: tx.type, category: tx.category, date: tx.date, recurring: tx.recurring };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  save() {
    if (!this.form.amount || !this.form.date) { this.formError = 'Montant et date sont requis.'; return; }
    this.saving = true; this.formError = '';
    const payload = { ...this.form, amount: parseFloat(this.form.amount) };
    const req = this.editId ? this.txService.update(this.editId, payload) : this.txService.create(payload);
    req.subscribe({
      next: (tx) => {
        if (this.editId) {
          const idx = this.pagedTransactions.findIndex(t => t.id === this.editId);
          if (idx !== -1) this.pagedTransactions[idx] = tx;
        } else {
          this.pagedTransactions = [tx, ...this.pagedTransactions].slice(0, this.PAGE_SIZE);
          this.totalElements++;
        }
        this.loadStats();
        this.closeModal();
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.formError = err.error?.message || 'Une erreur est survenue';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteTx(id: number) {
    if (!confirm('Supprimer cette transaction ?')) return;
    this.txService.delete(id).subscribe(() => {
      this.pagedTransactions = this.pagedTransactions.filter(t => t.id !== id);
      this.totalElements--;
      this.loadStats();
      this.cdr.detectChanges();
    });
  }

  getLabel(cat: string) { return CATEGORY_LABELS[cat] || cat; }
  getIcon(cat: string) { return CATEGORY_ICONS[cat] || '📦'; }
}
