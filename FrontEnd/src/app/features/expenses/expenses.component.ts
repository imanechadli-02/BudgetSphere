import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VariableExpenseService } from '../../core/services/variable-expense.service';
import { FixedExpenseService } from '../../core/services/fixed-expense.service';
import { TransactionService } from '../../core/services/transaction.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { VariableExpense, FixedExpense } from '../../core/models/models';
import { forkJoin } from 'rxjs';

export const CAT_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
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
  private txService = inject(TransactionService);
  private cdr = inject(ChangeDetectorRef);

  activeTab: 'variable' | 'fixed' = 'variable';
  loading = false;
  saving = false;
  showModal = false;
  editId: number | null = null;
  formError = '';
  searchQuery = '';
  filterCategory = '';

  readonly Math = Math;
  totalIncome = 0;
  variableExpenses: VariableExpense[] = [];
  fixedExpenses: FixedExpense[] = [];
  filteredVariable: VariableExpense[] = [];
  filteredFixed: FixedExpense[] = [];

  varForm = { title: '', amount: null as any, description: '', expenseDate: '', endDate: '', category: 'FOOD' };
  fixForm = { title: '', amount: null as any, description: '', frequency: 'MONTHLY', startDate: '', endDate: '', category: 'HOUSING' };

  categories = Object.entries(CAT_META).map(([value, m]) => ({ value, label: m.label }));
  frequencies = Object.entries(FREQ_LABELS).map(([value, label]) => ({ value, label }));

  private barChart: any = null;
  private pieChart: any = null;
  private trendChart: any = null;

  ngOnInit() { this.load(); }
  ngOnDestroy() { this.barChart?.destroy(); this.pieChart?.destroy(); this.trendChart?.destroy(); }

  load() {
    this.loading = true;
    forkJoin({
      variable: this.varService.getAll(),
      fixed: this.fixService.getAll(),
      transactions: this.txService.getAll(0, 200)
    }).subscribe({
      next: ({ variable, fixed, transactions }) => {
        this.variableExpenses = variable.content;
        this.fixedExpenses = fixed.content;
        this.totalIncome = transactions.content
          .filter(t => t.type === 'INCOME')
          .reduce((s, t) => s + t.amount, 0);
        this.loading = false;
        this.applyFilters();
        setTimeout(() => this.renderCharts(), 100);
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  applyFilters() {
    this.filteredVariable = this.variableExpenses.filter(e => this.matchFilter(e.title, e.category));
    this.filteredFixed = this.fixedExpenses.filter(e => this.matchFilter(e.title, e.category));
    this.cdr.detectChanges();
  }

  private matchFilter(title: string, category: string) {
    const q = this.searchQuery.toLowerCase();
    const matchQ = !q || title.toLowerCase().includes(q) || this.getCatLabel(category).toLowerCase().includes(q);
    const matchCat = !this.filterCategory || category === this.filterCategory;
    return matchQ && matchCat;
  }

  get allExpenses() {
    const varList = this.variableExpenses.map(e => ({ ...e, type: 'variable' as const }));
    const fixList = this.fixedExpenses.map(e => ({ ...e, type: 'fixed' as const, expenseDate: e.startDate }));
    return [...varList, ...fixList];
  }

  get totalVariable() { return this.variableExpenses.reduce((s, e) => s + e.amount, 0); }
  get totalFixed() { return this.fixedExpenses.reduce((s, e) => s + e.amount, 0); }
  get totalAll() { return this.totalVariable + this.totalFixed; }
  get remainingIncome() { return this.totalIncome - this.totalAll; }
  get savingsRate() { return this.totalIncome > 0 ? Math.round((this.remainingIncome / this.totalIncome) * 100) : 0; }

  get spentByCategory(): { key: string; label: string; icon: string; color: string; bg: string; spent: number }[] {
    const map: Record<string, number> = {};
    this.allExpenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map)
      .map(([key, spent]) => ({ key, spent, ...CAT_META[key] || { label: key, icon: '📦', color: '#64748b', bg: 'rgba(100,116,139,0.15)' } }))
      .sort((a, b) => b.spent - a.spent);
  }

  get monthlyTrend() {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleDateString('fr-FR', { month: 'short' });
      const total = this.variableExpenses
        .filter(e => { const ed = new Date(e.expenseDate); return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear(); })
        .reduce((s, e) => s + e.amount, 0);
      return { label, total };
    });
  }

  // --- Variable / Fixed CRUD ---
  openModal() {
    this.editId = null; this.formError = '';
    const today = new Date().toISOString().split('T')[0];
    if (this.activeTab === 'variable') {
      this.varForm = { title: '', amount: null, description: '', expenseDate: today, endDate: '', category: 'FOOD' };
    } else {
      this.fixForm = { title: '', amount: null, description: '', frequency: 'MONTHLY', startDate: today, endDate: '', category: 'HOUSING' };
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

  private readonly CAT_MAP: Record<string, string> = {
    FOOD: 'FOOD', TRANSPORT: 'TRANSPORT', HEALTH: 'HEALTH',
    ENTERTAINMENT: 'ENTERTAINMENT', EDUCATION: 'EDUCATION', SHOPPING: 'SHOPPING',
    HOUSING: 'HOUSING', UTILITIES: 'OTHER', SUBSCRIPTIONS: 'OTHER', OTHER: 'OTHER'
  };

  save() {
    this.saving = true; this.formError = '';
    if (this.activeTab === 'variable') {
      if (!this.varForm.title || !this.varForm.amount || !this.varForm.expenseDate) {
        this.formError = 'Titre, montant et date sont requis.'; this.saving = false; return;
      }
      const payload = { ...this.varForm, amount: parseFloat(this.varForm.amount), endDate: this.varForm.endDate || null };
      const req = this.editId ? this.varService.update(this.editId, payload) : this.varService.create(payload);
      req.subscribe({
        next: (saved) => {
          if (this.editId) {
            const idx = this.variableExpenses.findIndex(e => e.id === this.editId);
            if (idx !== -1) this.variableExpenses[idx] = saved;
          } else {
            this.variableExpenses = [saved, ...this.variableExpenses];
            this.txService.create({
              description: saved.title,
              amount: saved.amount,
              type: 'EXPENSE',
              category: this.CAT_MAP[saved.category] || 'OTHER',
              date: saved.expenseDate,
              recurring: false
            }).subscribe();
          }
          this.saving = false; this.showModal = false;
          this.applyFilters();
          setTimeout(() => this.renderCharts(), 100);
        },
        error: (err) => { this.formError = err.error?.message || 'Erreur'; this.saving = false; this.cdr.detectChanges(); }
      });
    } else {
      if (!this.fixForm.title || !this.fixForm.amount || !this.fixForm.startDate) {
        this.formError = 'Titre, montant et date de début sont requis.'; this.saving = false; return;
      }
      const payload = { ...this.fixForm, amount: parseFloat(this.fixForm.amount), endDate: this.fixForm.endDate || null };
      const req = this.editId ? this.fixService.update(this.editId, payload) : this.fixService.create(payload);
      req.subscribe({
        next: (saved) => {
          if (this.editId) {
            const idx = this.fixedExpenses.findIndex(e => e.id === this.editId);
            if (idx !== -1) this.fixedExpenses[idx] = saved;
          } else {
            this.fixedExpenses = [saved, ...this.fixedExpenses];
            this.txService.create({
              description: saved.title,
              amount: saved.amount,
              type: 'EXPENSE',
              category: this.CAT_MAP[saved.category] || 'OTHER',
              date: saved.startDate,
              recurring: true
            }).subscribe();
          }
          this.saving = false; this.showModal = false;
          this.applyFilters();
          setTimeout(() => this.renderCharts(), 100);
        },
        error: (err) => { this.formError = err.error?.message || 'Erreur'; this.saving = false; this.cdr.detectChanges(); }
      });
    }
  }

  deleteVar(id: number) {
    if (!confirm('Supprimer cette dépense ?')) return;
    this.varService.delete(id).subscribe(() => {
      this.variableExpenses = this.variableExpenses.filter(e => e.id !== id);
      this.applyFilters();
      setTimeout(() => this.renderCharts(), 100);
    });
  }

  deleteFix(id: number) {
    if (!confirm('Supprimer cette dépense fixe ?')) return;
    this.fixService.delete(id).subscribe(() => {
      this.fixedExpenses = this.fixedExpenses.filter(e => e.id !== id);
      this.applyFilters();
      setTimeout(() => this.renderCharts(), 100);
    });
  }


  // --- Charts ---
  renderCharts() {
    const win = window as any;
    if (!win.Chart) return;
    this.barChart?.destroy();
    this.pieChart?.destroy();
    this.trendChart?.destroy();

    const barEl = document.getElementById('barChart') as HTMLCanvasElement;
    const pieEl = document.getElementById('pieChart') as HTMLCanvasElement;
    const trendEl = document.getElementById('trendChart') as HTMLCanvasElement;

    const cats = this.spentByCategory;

    if (barEl && cats.length > 0) {
      this.barChart = new win.Chart(barEl.getContext('2d'), {
        type: 'bar',
        data: {
          labels: cats.map(c => c.label),
          datasets: [{ label: 'Dépensé (€)', data: cats.map(c => c.spent), backgroundColor: cats.map(c => c.color), borderRadius: 6 }]
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
    }

    if (pieEl && cats.length > 0) {
      this.pieChart = new win.Chart(pieEl.getContext('2d'), {
        type: 'doughnut',
        data: { labels: cats.map(c => c.label), datasets: [{ data: cats.map(c => c.spent), backgroundColor: cats.map(c => c.color), borderWidth: 0, hoverOffset: 6 }] },
        options: { responsive: true, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 }, padding: 10 } } } }
      });
    }

    if (trendEl) {
      const trend = this.monthlyTrend;
      this.trendChart = new win.Chart(trendEl.getContext('2d'), {
        type: 'line',
        data: {
          labels: trend.map(t => t.label),
          datasets: [{ label: 'Dépenses variables (€)', data: trend.map(t => t.total), borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)', tension: 0.4, fill: true, pointRadius: 4 }]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
          scales: {
            x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
            y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } }
          }
        }
      });
    }
  }

  getCatLabel(cat: string) { return CAT_META[cat]?.label || cat; }
  getCatIcon(cat: string) { return CAT_META[cat]?.icon || '📦'; }
  getCatColor(cat: string) { return CAT_META[cat]?.color || '#64748b'; }
  getCatBg(cat: string) { return CAT_META[cat]?.bg || 'rgba(100,116,139,0.15)'; }
  getFreqLabel(f: string) { return FREQ_LABELS[f] || f; }
  getBudgetColor(pct: number) { return pct >= 100 ? '#f87171' : pct >= 75 ? '#facc15' : '#4ade80'; }
}
