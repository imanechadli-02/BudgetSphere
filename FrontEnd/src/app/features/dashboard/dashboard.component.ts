import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { TransactionService } from '../../core/services/transaction.service';
import { SavingGoalService } from '../../core/services/saving-goal.service';
import { Transaction, SavingGoal } from '../../core/models/models';

declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  template: `
    <div class="min-h-screen" style="background:#0f172a;color:#f1f5f9;font-family:'Inter',sans-serif">
      <app-sidebar />
      <main class="lg:ml-64 p-6 min-h-screen">

        <!-- Header -->
        <div class="flex items-center justify-between mb-8 mt-8 lg:mt-0">
          <div>
            <h1 class="text-2xl font-bold" style="color:#f1f5f9">Bonjour, {{ user?.firstName }} 👋</h1>
            <p class="text-sm mt-1" style="color:#94a3b8">Voici un aperçu de vos finances</p>
          </div>
          <span class="text-sm" style="color:#94a3b8">{{ currentDate }}</span>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div class="card p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm" style="color:#94a3b8">Revenus (mois)</span>
              <span class="badge badge-green">INCOME</span>
            </div>
            <p class="text-3xl font-bold" style="color:#4ade80">{{ totalIncome | number:'1.0-0' }} €</p>
            <p class="text-xs mt-2" style="color:#64748b">Total des revenus</p>
          </div>
          <div class="card p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm" style="color:#94a3b8">Dépenses (mois)</span>
              <span class="badge badge-red">EXPENSE</span>
            </div>
            <p class="text-3xl font-bold" style="color:#f87171">{{ totalExpense | number:'1.0-0' }} €</p>
            <p class="text-xs mt-2" style="color:#64748b">Total des dépenses</p>
          </div>
          <div class="card p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm" style="color:#94a3b8">Solde</span>
              <span class="badge badge-blue">NET</span>
            </div>
            <p class="text-3xl font-bold" [style.color]="balance >= 0 ? '#818cf8' : '#f87171'">{{ balance | number:'1.0-0' }} €</p>
            <p class="text-xs mt-2" style="color:#64748b">Revenus - Dépenses</p>
          </div>
          <div class="card p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm" style="color:#94a3b8">Objectifs</span>
              <span class="badge badge-yellow">ÉPARGNE</span>
            </div>
            <p class="text-3xl font-bold" style="color:#facc15">{{ savingGoals.length }}</p>
            <p class="text-xs mt-2" style="color:#64748b">Objectifs actifs</p>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          <div class="card p-5 xl:col-span-2">
            <h2 class="font-semibold mb-4" style="color:#f1f5f9">Revenus vs Dépenses</h2>
            <canvas id="lineChart" height="120"></canvas>
          </div>
          <div class="card p-5">
            <h2 class="font-semibold mb-4" style="color:#f1f5f9">Répartition Dépenses</h2>
            <canvas id="donutChart" height="180"></canvas>
            <div class="mt-4 space-y-2">
              <div *ngFor="let cat of categoryData" class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full inline-block" [style.background]="cat.color"></span>
                  <span style="color:#94a3b8">{{ cat.label }}</span>
                </div>
                <span class="font-medium" style="color:#f1f5f9">{{ cat.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold" style="color:#f1f5f9">Transactions Récentes</h2>
              <a routerLink="/transactions" class="text-xs" style="color:#818cf8">Voir tout</a>
            </div>
            <div class="space-y-3">
              <div *ngIf="transactions.length === 0" class="text-sm text-center py-4" style="color:#64748b">Aucune transaction</div>
              <div *ngFor="let tx of transactions" class="flex items-center gap-3 p-3 rounded-xl cursor-pointer" style="transition:background 0.2s" onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='transparent'">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                     [style.background]="tx.type === 'INCOME' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'">
                  {{ tx.type === 'INCOME' ? '💰' : '💸' }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium" style="color:#f1f5f9">{{ tx.description || tx.category }}</p>
                  <p class="text-xs" style="color:#64748b">{{ tx.category }} · {{ tx.date | date:'dd MMM' }}</p>
                </div>
                <span class="font-semibold text-sm" [style.color]="tx.type === 'INCOME' ? '#4ade80' : '#f87171'">
                  {{ tx.type === 'INCOME' ? '+' : '-' }}{{ tx.amount | number:'1.0-0' }} €
                </span>
              </div>
            </div>
          </div>

          <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold" style="color:#f1f5f9">Objectifs d'Épargne</h2>
              <a routerLink="/savings" class="text-xs" style="color:#818cf8">Gérer</a>
            </div>
            <div class="space-y-4">
              <div *ngIf="savingGoals.length === 0" class="text-sm text-center py-4" style="color:#64748b">Aucun objectif</div>
              <div *ngFor="let goal of savingGoals">
                <div class="flex justify-between text-sm mb-1.5">
                  <span class="font-medium" style="color:#f1f5f9">{{ goal.title }}</span>
                  <span style="color:#94a3b8">{{ goal.currentAmount | number:'1.0-0' }} € / {{ goal.targetAmount | number:'1.0-0' }} €</span>
                </div>
                <div class="h-2 rounded-full overflow-hidden" style="background:#334155">
                  <div class="h-full rounded-full" style="background:#6366f1;transition:width 0.3s" [style.width.%]="goal.progressPercentage"></div>
                </div>
                <p class="text-xs mt-1" style="color:#64748b">{{ goal.progressPercentage | number:'1.0-0' }}% atteint</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; }
    .badge { padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500; }
    .badge-green { background: rgba(34,197,94,0.15); color: #22c55e; }
    .badge-red { background: rgba(239,68,68,0.15); color: #ef4444; }
    .badge-blue { background: rgba(99,102,241,0.15); color: #6366f1; }
    .badge-yellow { background: rgba(234,179,8,0.15); color: #eab308; }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private transactionService = inject(TransactionService);
  private savingGoalService = inject(SavingGoalService);

  user = this.authService.getUser();
  currentDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  transactions: Transaction[] = [];
  savingGoals: SavingGoal[] = [];
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;
  categoryData: { label: string; percentage: number; color: string }[] = [];
  private chartInstances: any[] = [];

  ngOnInit() {
    this.transactionService.getAll(0, 5).subscribe(res => {
      this.transactions = res.content;
      this.totalIncome = res.content.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
      this.totalExpense = res.content.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
      this.balance = this.totalIncome - this.totalExpense;
      this.buildCategoryData(res.content);
      setTimeout(() => this.initCharts(), 0);
    });
    this.savingGoalService.getAll(0, 3).subscribe(res => {
      this.savingGoals = res.content;
    });
  }

  ngAfterViewInit() {}

  buildCategoryData(transactions: Transaction[]) {
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const total = expenses.reduce((s, t) => s + t.amount, 0);
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#eab308', '#22c55e', '#ef4444'];
    const grouped: Record<string, number> = {};
    expenses.forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + t.amount; });
    this.categoryData = Object.entries(grouped).map(([label, amount], i) => ({
      label,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      color: colors[i % colors.length]
    }));
  }

  initCharts() {
    this.chartInstances.forEach(c => c.destroy());
    this.chartInstances = [];
    const lineEl = document.getElementById('lineChart') as HTMLCanvasElement;
    const donutEl = document.getElementById('donutChart') as HTMLCanvasElement;
    if (!lineEl || !donutEl) return;

    this.chartInstances.push(new Chart(lineEl.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Revenus', 'Dépenses', 'Solde'],
        datasets: [{
          data: [this.totalIncome, this.totalExpense, Math.abs(this.balance)],
          backgroundColor: ['rgba(34,197,94,0.7)', 'rgba(239,68,68,0.7)', 'rgba(99,102,241,0.7)'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
          y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } }
        }
      }
    }));

    const labels = this.categoryData.length ? this.categoryData.map(c => c.label) : ['Aucune dépense'];
    const data = this.categoryData.length ? this.categoryData.map(c => c.percentage) : [100];
    const colors = this.categoryData.length ? this.categoryData.map(c => c.color) : ['#334155'];

    this.chartInstances.push(new Chart(donutEl.getContext('2d'), {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
      options: { responsive: true, cutout: '70%', plugins: { legend: { display: false } } }
    }));
  }
}
