import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VariableExpenseService } from '../../core/services/variable-expense.service';
import { FixedExpenseService } from '../../core/services/fixed-expense.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { VariableExpense, FixedExpense } from '../../core/models/models';
import { forkJoin } from 'rxjs';

const CAT_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  FOOD:          { label: 'Alimentation', icon: '🛒', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  HOUSING:       { label: 'Logement',     icon: '🏠', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  TRANSPORT:     { label: 'Transport',    icon: '🚗', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
  ENTERTAINMENT: { label: 'Loisirs',      icon: '🎬', color: '#eab308', bg: 'rgba(234,179,8,0.15)'  },
  HEALTH:        { label: 'Santé',        icon: '💊', color: '#22c55e', bg: 'rgba(34,197,94,0.15)'  },
  EDUCATION:     { label: 'Éducation',    icon: '📚', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)'  },
  SHOPPING:      { label: 'Shopping',     icon: '🛍️', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  UTILITIES:     { label: 'Charges',      icon: '⚡', color: '#facc15', bg: 'rgba(250,204,21,0.15)' },
  SUBSCRIPTIONS: { label: 'Abonnements',  icon: '📱', color: '#818cf8', bg: 'rgba(129,140,248,0.15)'},
  OTHER:         { label: 'Autre',        icon: '📦', color: '#64748b', bg: 'rgba(100,116,139,0.15)'},
};

const FREQ_LABELS: Record<string, string> = {
  DAILY: 'Quotidien', WEEKLY: 'Hebdomadaire', MONTHLY: 'Mensuel', YEARLY: 'Annuel'
};

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  styles: [`
    .card { background:#1e293b; border:1px solid #334155; border-radius:16px; }
    .input-field { background:#0f172a; border:1px solid #334155; color:#f1f5f9; border-radius:12px; padding:10px 16px; font-size:14px; width:100%; }
    .input-field:focus { outline:none; border-color:#6366f1; }
    .input-field option { background:#1e293b; }
    .progress-bar { height:8px; border-radius:999px; background:#334155; overflow:hidden; }
    .progress-fill { height:100%; border-radius:999px; transition:width 0.6s ease; }
    .tab-btn { padding:8px 20px; border-radius:10px; font-size:14px; font-weight:500; transition:all 0.2s; cursor:pointer; border:none; }
    .tab-active { background:#4f46e5; color:white; }
    .tab-inactive { background:#1e293b; color:#94a3b8; }
    .tab-inactive:hover { background:#334155; color:#f1f5f9; }
  `],
  templateUrl: './expenses.component.html'
})
export class ExpensesComponent implements OnInit, OnDestroy {
  private varService = inject(VariableExpenseService);
  private fixService = inject(FixedExpenseService);

  activeTab: 'variable' | 'fixed' = 'variable';
  loading = false;
  saving = false;
  showModal = false;
  editId: number | null = null;
  formError = '';
  searchQuery = '';
  filterCategory = '';

  variableExpenses: VariableExpense[] = [];
  fixedExpenses: FixedExpense[] = [];

  varForm = { title: '', amount: null as any, description: '', expenseDate: '', endDate: '', category: 'FOOD' };
  fixForm = { title: '', amount: null as any, description: '', frequency: 'MONTHLY', startDate: '', endDate: '', category: 'HOUSING' };

  categories = Object.entries(CAT_META).map(([value, m]) => ({ value, label: m.label }));
  frequencies = Object.entries(FREQ_LABELS).map(([value, label]) => ({ value, label }));

  private barChart: any = null;
  private pieChart: any = null;

  ngOnInit() { this.load(); }

  ngOnDestroy() { this.barChart?.destroy(); this.pieChart?.destroy(); }

  load() {
    this.loading = true;
    forkJoin({
      variable: this.varService.getAll(),
      fixed: this.fixService.getAll()
    }).subscribe({
      next: ({ variable, fixed }) => {
        this.variableExpenses = variable.content;
        this.fixedExpenses = fixed.content;
        this.loading = false;
        setTimeout(() => this.renderCharts(), 100);
      },
      error: () => { this.loading = false; }
    });
  }

  get allExpenses() {
    const varList = this.variableExpenses.map(e => ({ ...e, type: 'variable' as const }));
    const fixList = this.fixedExpenses.map(e => ({ ...e, type: 'fixed' as const, expenseDate: e.startDate }));
    return [...varList, ...fixList];
  }

  get filteredVariable() {
    return this.variableExpenses.filter(e => this.matchFilter(e.title, e.category));
  }

  get filteredFixed() {
    return this.fixedExpenses.filter(e => this.matchFilter(e.title, e.category));
  }

  private matchFilter(title: string, category: string) {
    const q = this.searchQuery.toLowerCase();
    const matchQ = !q || title.toLowerCase().includes(q) || this.getCatLabel(category).toLowerCase().includes(q);
    const matchCat = !this.filterCategory || category === this.filterCategory;
    return matchQ && matchCat;
  }

  get totalVariable() { return this.variableExpenses.reduce((s, e) => s + e.amount, 0); }
  get totalFixed() { return this.fixedExpenses.reduce((s, e) => s + e.amount, 0); }
  get totalAll() { return this.totalVariable + this.totalFixed; }

  get budgetByCategory() {
    const result: Record<string, { spent: number; label: string; color: string; bg: string; icon: string }> = {};
    this.allExpenses.forEach(e => {
      if (!result[e.category]) {
        const m = CAT_META[e.category] || CAT_META['OTHER'];
        result[e.category] = { spent: 0, label: m.label, color: m.color, bg: m.bg, icon: m.icon };
      }
      result[e.category].spent += e.amount;
    });
    return Object.entries(result).sort((a, b) => b[1].spent - a[1].spent);
  }

  openModal() {
    this.editId = null; this.formError = '';
    if (this.activeTab === 'variable') {
      this.varForm = { title: '', amount: null, description: '', expenseDate: new Date().toISOString().split('T')[0], endDate: '', category: 'FOOD' };
    } else {
      this.fixForm = { title: '', amount: null, description: '', frequency: 'MONTHLY', startDate: new Date().toISOString().split('T')[0], endDate: '', category: 'HOUSING' };
    }
    this.showModal = true;
  }

  editVar(e: VariableExpense) {
    this.activeTab = 'variable'; this.editId = e.id; this.formError = '';
    this.varForm = { title: e.title, amount: e.amount, description: e.description || '', expenseDate: e.expenseDate, endDate: e.endDate || '', category: e.category };
    this.showModal = true;
  }

  editFix(e: FixedExpense) {
    this.activeTab = 'fixed'; this.editId = e.id; this.formError = '';
    this.fixForm = { title: e.title, amount: e.amount, description: e.description || '', frequency: e.frequency, startDate: e.startDate, endDate: e.endDate || '', category: e.category };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  save() {
    this.saving = true; this.formError = '';
    if (this.activeTab === 'variable') {
      if (!this.varForm.title || !this.varForm.amount || !this.varForm.expenseDate) {
        this.formError = 'Titre, montant et date sont requis.'; this.saving = false; return;
      }
      const payload = { ...this.varForm, amount: parseFloat(this.varForm.amount), endDate: this.varForm.endDate || null };
      const req = this.editId ? this.varService.update(this.editId, payload) : this.varService.create(payload);
      req.subscribe({ next: () => { this.closeModal(); this.load(); this.saving = false; }, error: (err) => { this.formError = err.error?.message || 'Erreur'; this.saving = false; } });
    } else {
      if (!this.fixForm.title || !this.fixForm.amount || !this.fixForm.startDate) {
        this.formError = 'Titre, montant et date de début sont requis.'; this.saving = false; return;
      }
      const payload = { ...this.fixForm, amount: parseFloat(this.fixForm.amount), endDate: this.fixForm.endDate || null };
      const req = this.editId ? this.fixService.update(this.editId, payload) : this.fixService.create(payload);
      req.subscribe({ next: () => { this.closeModal(); this.load(); this.saving = false; }, error: (err) => { this.formError = err.error?.message || 'Erreur'; this.saving = false; } });
    }
  }

  deleteVar(id: number) {
    if (!confirm('Supprimer cette dépense ?')) return;
    this.varService.delete(id).subscribe(() => this.load());
  }

  deleteFix(id: number) {
    if (!confirm('Supprimer cette dépense fixe ?')) return;
    this.fixService.delete(id).subscribe(() => this.load());
  }

  renderCharts() {
    const win = window as any;
    if (!win.Chart) return;
    this.barChart?.destroy();
    this.pieChart?.destroy();

    const barEl = document.getElementById('barChart') as HTMLCanvasElement;
    const pieEl = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!barEl || !pieEl) return;

    const cats = this.budgetByCategory;
    const labels = cats.map(([, v]) => v.label);
    const data = cats.map(([, v]) => v.spent);
    const colors = cats.map(([, v]) => v.color);

    this.barChart = new win.Chart(barEl.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Dépensé (€)', data, backgroundColor: colors, borderRadius: 6 }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { display: false } },
          y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } }
        }
      }
    });

    this.pieChart = new win.Chart(pieEl.getContext('2d'), {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
      options: { responsive: true, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 }, padding: 10 } } } }
    });
  }

  getCatLabel(cat: string) { return CAT_META[cat]?.label || cat; }
  getCatIcon(cat: string) { return CAT_META[cat]?.icon || '📦'; }
  getCatColor(cat: string) { return CAT_META[cat]?.color || '#64748b'; }
  getCatBg(cat: string) { return CAT_META[cat]?.bg || 'rgba(100,116,139,0.15)'; }
  getFreqLabel(f: string) { return FREQ_LABELS[f] || f; }
}
