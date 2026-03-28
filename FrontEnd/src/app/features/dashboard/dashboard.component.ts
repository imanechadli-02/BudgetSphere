import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { TransactionService } from '../../core/services/transaction.service';
import { SavingGoalService } from '../../core/services/saving-goal.service';
import { Transaction, SavingGoal } from '../../core/models/models';
import { forkJoin } from 'rxjs';

const CAT_LABELS: Record<string, string> = {
  SALARY: 'Salaire', FOOD: 'Alimentation', TRANSPORT: 'Transport', HEALTH: 'Santé',
  ENTERTAINMENT: 'Loisirs', EDUCATION: 'Éducation', SHOPPING: 'Shopping',
  HOUSING: 'Logement', SAVINGS: 'Épargne', OTHER: 'Autre'
};
const CAT_ICONS: Record<string, string> = {
  SALARY: '💰', FOOD: '🛒', TRANSPORT: '🚗', HEALTH: '💊',
  ENTERTAINMENT: '🎬', EDUCATION: '📚', SHOPPING: '🛍️', HOUSING: '🏠', SAVINGS: '🏦', OTHER: '📦'
};
const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#eab308', '#22c55e', '#ef4444', '#06b6d4', '#f97316'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styles: [`
    .card { background:#1e293b; border:1px solid #334155; border-radius:16px; }
    .badge { padding:2px 8px; border-radius:9999px; font-size:11px; font-weight:500; }
    .badge-green { background:rgba(34,197,94,0.15); color:#22c55e; }
    .badge-red { background:rgba(239,68,68,0.15); color:#ef4444; }
    .badge-blue { background:rgba(99,102,241,0.15); color:#6366f1; }
    .badge-yellow { background:rgba(234,179,8,0.15); color:#eab308; }
    .badge-purple { background:rgba(168,85,247,0.15); color:#a855f7; }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private transactionService = inject(TransactionService);
  private savingGoalService = inject(SavingGoalService);
  private cdr = inject(ChangeDetectorRef);

  user = this.authService.getUser();
  currentDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Data
  allTransactions: Transaction[] = [];
  transactions: Transaction[] = [];
  savingGoals: SavingGoal[] = [];

  // KPIs
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;
  savingsRate = 0;
  incomeCount = 0;
  expenseCount = 0;
  achievedGoals = 0;
  totalSaved = 0;

  // Month comparison
  currentMonthIncome = 0;
  currentMonthExpense = 0;
  prevMonthIncome = 0;
  prevMonthExpense = 0;
  incomeEvolution = 0;
  expenseEvolution = 0;

  // Charts data
  categoryData: { label: string; percentage: number; amount: number; color: string }[] = [];
  monthlyTrend: { label: string; income: number; expense: number }[] = [];

  private charts: any[] = [];

  ngOnInit() {
    forkJoin({
      transactions: this.transactionService.getAll(0, 500),
      goals: this.savingGoalService.getAll(0, 10)
    }).subscribe({
      next: ({ transactions, goals }) => {
        console.log('transactions reçues:', transactions);
        console.log('premier élément:', transactions.content[0]);
        this.allTransactions = transactions.content;
        this.transactions = transactions.content.slice(0, 5);
        this.savingGoals = goals.content;
        this.compute();
        console.log('totalIncome:', this.totalIncome, 'totalExpense:', this.totalExpense);
        this.cdr.detectChanges();
        setTimeout(() => this.initCharts(), 0);
      },
      error: () => {}
    });
  }

  ngOnDestroy() { this.charts.forEach(c => c.destroy()); }

  compute() {
    const all = this.allTransactions;
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();
    const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
    const prevYear = curMonth === 0 ? curYear - 1 : curYear;

    // Totaux globaux
    this.totalIncome = all.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
    this.totalExpense = all.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
    this.balance = this.totalIncome - this.totalExpense;
    this.savingsRate = this.totalIncome > 0 ? Math.round((this.balance / this.totalIncome) * 100) : 0;
    this.incomeCount = all.filter(t => t.type === 'INCOME').length;
    this.expenseCount = all.filter(t => t.type === 'EXPENSE').length;
    this.achievedGoals = this.savingGoals.filter(g => g.isAchieved).length;
    this.totalSaved = this.savingGoals.reduce((s, g) => s + Number(g.currentAmount), 0);

    // Mois actuel vs précédent
    const inMonth = (t: Transaction, m: number, y: number) => {
      const parts = t.date.toString().split('-');
      return parseInt(parts[1]) - 1 === m && parseInt(parts[0]) === y;
    };
    this.currentMonthIncome = all.filter(t => t.type === 'INCOME' && inMonth(t, curMonth, curYear)).reduce((s, t) => s + Number(t.amount), 0);
    this.currentMonthExpense = all.filter(t => t.type === 'EXPENSE' && inMonth(t, curMonth, curYear)).reduce((s, t) => s + Number(t.amount), 0);
    this.prevMonthIncome = all.filter(t => t.type === 'INCOME' && inMonth(t, prevMonth, prevYear)).reduce((s, t) => s + Number(t.amount), 0);
    this.prevMonthExpense = all.filter(t => t.type === 'EXPENSE' && inMonth(t, prevMonth, prevYear)).reduce((s, t) => s + Number(t.amount), 0);
    this.incomeEvolution = this.prevMonthIncome > 0 ? Math.round(((this.currentMonthIncome - this.prevMonthIncome) / this.prevMonthIncome) * 100) : 0;
    this.expenseEvolution = this.prevMonthExpense > 0 ? Math.round(((this.currentMonthExpense - this.prevMonthExpense) / this.prevMonthExpense) * 100) : 0;

    // Catégories
    const expenses = all.filter(t => t.type === 'EXPENSE');
    const total = expenses.reduce((s, t) => s + Number(t.amount), 0);
    const grouped: Record<string, number> = {};
    expenses.forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + Number(t.amount); });
    this.categoryData = Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amount], i) => ({
        label: CAT_LABELS[cat] || cat,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        color: COLORS[i % COLORS.length]
      }));

    // Tendance 6 mois
    this.monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(curYear, curMonth - (5 - i), 1);
      const m = d.getMonth(), y = d.getFullYear();
      return {
        label: d.toLocaleDateString('fr-FR', { month: 'short' }),
        income: all.filter(t => t.type === 'INCOME' && inMonth(t, m, y)).reduce((s, t) => s + Number(t.amount), 0),
        expense: all.filter(t => t.type === 'EXPENSE' && inMonth(t, m, y)).reduce((s, t) => s + Number(t.amount), 0)
      };
    });
  }

  initCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
    const win = window as any;
    if (!win.Chart) return;

    // Chart tendance 6 mois
    const trendEl = document.getElementById('trendChart') as HTMLCanvasElement;
    if (trendEl) {
      this.charts.push(new win.Chart(trendEl.getContext('2d'), {
        type: 'line',
        data: {
          labels: this.monthlyTrend.map(m => m.label),
          datasets: [
            { label: 'Revenus', data: this.monthlyTrend.map(m => m.income), borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)', tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#4ade80' },
            { label: 'Dépenses', data: this.monthlyTrend.map(m => m.expense), borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)', tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#f87171' }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
          scales: {
            x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
            y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } }
          }
        }
      }));
    }

    // Chart donut catégories
    const donutEl = document.getElementById('donutChart') as HTMLCanvasElement;
    if (donutEl && this.categoryData.length > 0) {
      this.charts.push(new win.Chart(donutEl.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: this.categoryData.map(c => c.label),
          datasets: [{ data: this.categoryData.map(c => c.percentage), backgroundColor: this.categoryData.map(c => c.color), borderWidth: 0, hoverOffset: 8 }]
        },
        options: { responsive: true, cutout: '70%', plugins: { legend: { display: false } } }
      }));
    }

    // Chart bar mois actuel
    const barEl = document.getElementById('barChart') as HTMLCanvasElement;
    if (barEl) {
      this.charts.push(new win.Chart(barEl.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Revenus', 'Dépenses', 'Solde'],
          datasets: [{
            data: [this.currentMonthIncome, this.currentMonthExpense, Math.max(0, this.currentMonthIncome - this.currentMonthExpense)],
            backgroundColor: ['rgba(74,222,128,0.8)', 'rgba(248,113,113,0.8)', 'rgba(99,102,241,0.8)'],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#64748b' }, grid: { display: false } },
            y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } }
          }
        }
      }));
    }
  }

  getLabel(cat: string) { return CAT_LABELS[cat] || cat; }
  getIcon(cat: string) { return CAT_ICONS[cat] || '📦'; }
}
