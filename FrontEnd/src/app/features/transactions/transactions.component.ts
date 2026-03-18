import { Component, OnInit, inject } from '@angular/core';
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

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  pagedTransactions: Transaction[] = [];
  loading = false;
  saving = false;
  showModal = false;
  editId: number | null = null;
  formError = '';
  searchQuery = '';
  filterType = '';
  filterCategory = '';
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];
  readonly PAGE_SIZE = 8;
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;

  form = { description: '', amount: null as any, type: 'EXPENSE', category: 'FOOD', date: '', recurring: false };
  categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.txService.getAll(0, 200).subscribe({
      next: res => { this.transactions = res.content; this.applyFilters(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applyFilters() {
    let result = [...this.transactions];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t => t.description?.toLowerCase().includes(q) || CATEGORY_LABELS[t.category]?.toLowerCase().includes(q));
    }
    if (this.filterType) result = result.filter(t => t.type === this.filterType);
    if (this.filterCategory) result = result.filter(t => t.category === this.filterCategory);
    this.filteredTransactions = result;
    this.totalIncome = result.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    this.totalExpense = result.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    this.balance = this.totalIncome - this.totalExpense;
    this.currentPage = 1;
    this.updatePagination();
  }

  resetFilters() { this.searchQuery = ''; this.filterType = ''; this.filterCategory = ''; this.applyFilters(); }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.PAGE_SIZE) || 1;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * this.PAGE_SIZE;
    this.pagedTransactions = this.filteredTransactions.slice(start, start + this.PAGE_SIZE);
  }

  goPage(p: number) { this.currentPage = p; this.updatePagination(); }

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
      next: () => { this.closeModal(); this.load(); this.saving = false; },
      error: (err) => { this.formError = err.error?.message || 'Une erreur est survenue'; this.saving = false; }
    });
  }

  deleteTx(id: number) {
    if (!confirm('Supprimer cette transaction ?')) return;
    this.txService.delete(id).subscribe(() => this.load());
  }

  getLabel(cat: string) { return CATEGORY_LABELS[cat] || cat; }
  getIcon(cat: string) { return CATEGORY_ICONS[cat] || '📦'; }
}
