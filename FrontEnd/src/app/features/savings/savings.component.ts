import { Component, OnInit, inject, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SavingGoalService } from '../../core/services/saving-goal.service';
import { TransactionService } from '../../core/services/transaction.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { SavingGoal } from '../../core/models/models';

const GOAL_COLORS = ['#6366f1', '#a855f7', '#22c55e', '#eab308', '#ec4899', '#06b6d4'];

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  styles: [`
    .card { background:#1e293b; border:1px solid #334155; border-radius:16px; }
    .input-field { background:#0f172a; border:1px solid #334155; color:#f1f5f9; border-radius:12px; padding:10px 16px; font-size:14px; width:100%; }
    .input-field:focus { outline:none; border-color:#6366f1; }
    .input-field option { background:#1e293b; }
    .goal-card { background:#1e293b; border:1px solid #334155; border-radius:16px; transition:all 0.3s; }
    .goal-card:hover { border-color:#6366f1; transform:translateY(-2px); }
    .progress-bar { height:10px; border-radius:999px; background:#334155; overflow:hidden; }
    .progress-fill { height:100%; border-radius:999px; transition:width 0.8s ease; }
  `],
  templateUrl: './savings.component.html'
})
export class SavingsComponent implements OnInit, AfterViewInit, OnDestroy {
  private savingService = inject(SavingGoalService);
  private txService = inject(TransactionService);
  private cdr = inject(ChangeDetectorRef);

  totalIncome = 0;
  totalExpense = 0;
  balance = 0;

  readonly today = new Date().toISOString().split('T')[0];
  goals: SavingGoal[] = [];
  loading = false;
  saving = false;
  showModal = false;
  showDepositModal = false;
  editId: number | null = null;
  depositGoal: SavingGoal | null = null;
  depositAmount: number | null = null;
  formError = '';

  form = {
    title: '',
    targetAmount: null as any,
    currentAmount: 0 as any,
    deadline: '',
    monthlyContribution: null as any
  };

  private radarChart: any = null;
  private lineChart: any = null;

  ngOnInit() { this.load(); this.loadStats(); }

  loadStats() {
    this.txService.getStats().subscribe(s => {
      this.totalIncome = s.totalIncome;
      this.totalExpense = s.totalExpense;
      this.balance = s.balance;
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.radarChart?.destroy();
    this.lineChart?.destroy();
  }

  load() {
    this.loading = true;
    this.savingService.getAll().subscribe({
      next: res => {
        this.goals = res.content;
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.renderCharts(), 100);
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  get totalSaved() { return this.goals.reduce((s, g) => s + g.currentAmount, 0); }
  get countAchieved() { return this.goals.filter(g => g.isAchieved).length; }
  get countActive() { return this.goals.filter(g => !g.isAchieved).length; }

  getColor(i: number) { return GOAL_COLORS[i % GOAL_COLORS.length]; }
  getColorBg(i: number) { return GOAL_COLORS[i % GOAL_COLORS.length] + '20'; }

  openModal() {
    this.editId = null; this.formError = '';
    this.form = { title: '', targetAmount: null, currentAmount: 0, deadline: '', monthlyContribution: null };
    this.showModal = true;
  }

  editGoal(g: SavingGoal) {
    this.editId = g.id; this.formError = '';
    this.form = {
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      deadline: g.deadline,
      monthlyContribution: g.monthlyContribution
    };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  save() {
    if (!this.form.title || !this.form.targetAmount || !this.form.deadline) {
      this.formError = 'Nom, montant cible et date sont requis.'; return;
    }
    if (new Date(this.form.deadline) <= new Date()) {
      this.formError = 'La date cible doit être dans le futur.'; return;
    }
    this.saving = true; this.formError = '';
    const payload = {
      title: this.form.title,
      targetAmount: parseFloat(this.form.targetAmount),
      currentAmount: parseFloat(this.form.currentAmount) || 0,
      deadline: this.form.deadline,
      monthlyContribution: parseFloat(this.form.monthlyContribution) || 0
    };
    const req = this.editId ? this.savingService.update(this.editId, payload) : this.savingService.create(payload);
    req.subscribe({
      next: (goal) => {
        if (this.editId) {
          const idx = this.goals.findIndex(g => g.id === this.editId);
          if (idx !== -1) this.goals[idx] = goal;
        } else {
          this.goals = [goal, ...this.goals];
        }
        this.closeModal();
        this.saving = false;
        this.cdr.detectChanges();
        setTimeout(() => this.renderCharts(), 100);
      },
      error: (err) => {
        const e = err.error;
        if (e?.messages) {
          this.formError = Object.values(e.messages).join(' | ');
        } else {
          this.formError = e?.message || 'Une erreur est survenue';
        }
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteGoal(id: number) {
    if (!confirm('Supprimer cet objectif ?')) return;
    this.savingService.delete(id).subscribe(() => {
      this.goals = this.goals.filter(g => g.id !== id);
      this.loadStats();
      this.cdr.detectChanges();
      setTimeout(() => this.renderCharts(), 100);
    });
  }

  openDeposit(g: SavingGoal) {
    this.depositGoal = g;
    this.depositAmount = null;
    this.showDepositModal = true;
  }

  closeDeposit() { this.showDepositModal = false; this.depositGoal = null; }

  confirmDeposit() {
    if (!this.depositGoal || !this.depositAmount || this.depositAmount <= 0) return;
    this.savingService.addContribution(this.depositGoal.id, this.depositAmount).subscribe(goal => {
      const idx = this.goals.findIndex(g => g.id === goal.id);
      if (idx !== -1) this.goals[idx] = goal;
      this.closeDeposit();
      this.loadStats();
      this.cdr.detectChanges();
      setTimeout(() => this.renderCharts(), 100);
    });
  }

  renderCharts() {
    const win = window as any;
    if (!win.Chart) return;

    this.radarChart?.destroy();
    this.lineChart?.destroy();

    const radarEl = document.getElementById('radarChart') as HTMLCanvasElement;
    const lineEl = document.getElementById('lineChart') as HTMLCanvasElement;
    if (!radarEl || !lineEl) return;

    this.radarChart = new win.Chart(radarEl.getContext('2d'), {
      type: 'radar',
      data: {
        labels: this.goals.map(g => g.title.length > 10 ? g.title.substring(0, 10) + '…' : g.title),
        datasets: [{
          label: 'Progression %',
          data: this.goals.map(g => Math.min(Math.round(g.progressPercentage), 100)),
          backgroundColor: 'rgba(99,102,241,0.2)',
          borderColor: '#6366f1',
          pointBackgroundColor: '#6366f1',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { color: '#64748b', stepSize: 25 },
            grid: { color: '#334155' },
            pointLabels: { color: '#94a3b8', font: { size: 11 } }
          }
        },
        plugins: { legend: { display: false } }
      }
    });

    this.lineChart = new win.Chart(lineEl.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['M-5', 'M-4', 'M-3', 'M-2', 'M-1', 'Actuel'],
        datasets: this.goals.slice(0, 4).map((g, i) => ({
          label: g.title,
          data: this.generateHistory(g),
          borderColor: GOAL_COLORS[i % GOAL_COLORS.length],
          tension: 0.4,
          fill: false,
          pointRadius: 3
        }))
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

  private generateHistory(g: SavingGoal): number[] {
    const step = g.monthlyContribution || (g.currentAmount / 6);
    return Array.from({ length: 6 }, (_, i) =>
      Math.max(0, Math.round(g.currentAmount - step * (5 - i)))
    );
  }
}
