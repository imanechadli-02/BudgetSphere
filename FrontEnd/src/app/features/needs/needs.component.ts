import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NeedService } from '../../core/services/need.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { Need } from '../../core/models/models';

const PRIORITY_LABELS: Record<string, string> = { LOW: 'Faible', MEDIUM: 'Moyenne', HIGH: 'Haute' };
const PRIORITY_COLORS: Record<string, string> = { LOW: '#4ade80', MEDIUM: '#facc15', HIGH: '#f87171' };
const PRIORITY_BG: Record<string, string> = { LOW: 'rgba(74,222,128,0.15)', MEDIUM: 'rgba(250,204,21,0.15)', HIGH: 'rgba(248,113,113,0.15)' };
const STATUS_LABELS: Record<string, string> = { PENDING: 'En attente', IN_PROGRESS: 'En cours', FULFILLED: 'Accompli' };
const STATUS_COLORS: Record<string, string> = { PENDING: '#94a3b8', IN_PROGRESS: '#818cf8', FULFILLED: '#4ade80' };
const STATUS_BG: Record<string, string> = { PENDING: '#334155', IN_PROGRESS: 'rgba(99,102,241,0.15)', FULFILLED: 'rgba(74,222,128,0.15)' };

@Component({
  selector: 'app-needs',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  styles: [`
    .card { background:#1e293b; border:1px solid #334155; border-radius:16px; }
    .input-field { background:#0f172a; border:1px solid #334155; color:#f1f5f9; border-radius:12px; padding:10px 16px; font-size:14px; width:100%; }
    .input-field:focus { outline:none; border-color:#6366f1; }
    .input-field option { background:#1e293b; }
    .item-row { transition: all 0.2s; }
    .item-row:hover { background: rgba(255,255,255,0.03); }
    .item-fulfilled { opacity: 0.5; }
    .priority-high { border-left: 3px solid #ef4444; }
    .priority-medium { border-left: 3px solid #eab308; }
    .priority-low { border-left: 3px solid #22c55e; }
  `],
  templateUrl: './needs.component.html'
})
export class NeedsComponent implements OnInit {
  private needService = inject(NeedService);
  private cdr = inject(ChangeDetectorRef);

  needs: Need[] = [];
  filtered: Need[] = [];
  loading = false;
  saving = false;
  showModal = false;
  editId: number | null = null;
  formError = '';
  searchQuery = '';
  filterStatus = '';
  filterPriority = '';

  form = { title: '', estimatedPrice: null as any, status: 'PENDING', priority: 'MEDIUM' };
  statuses = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));
  priorities = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }));

  ngOnInit() { this.load(); }

  load(silent = false) {
    if (!silent) this.loading = true;
    this.needService.getAll().subscribe({
      next: res => { this.needs = res.content ?? []; this.loading = false; this.applyFilters(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  applyFilters() {
    let result = [...this.needs];
    const q = this.searchQuery.toLowerCase();
    if (q) result = result.filter(n => n.title.toLowerCase().includes(q));
    if (this.filterStatus) result = result.filter(n => n.status === this.filterStatus);
    if (this.filterPriority) result = result.filter(n => n.priority === this.filterPriority);
    this.filtered = result;
    this.cdr.detectChanges();
  }

  get totalEstimated() { return this.filtered.reduce((s, n) => s + n.estimatedPrice, 0); }
  get countFulfilled() { return this.needs.filter(n => n.status === 'FULFILLED').length; }
  get countPending() { return this.needs.filter(n => n.status === 'PENDING').length; }

  openModal() {
    this.editId = null; this.formError = '';
    this.form = { title: '', estimatedPrice: null, status: 'PENDING', priority: 'MEDIUM' };
    this.showModal = true;
  }

  editNeed(n: Need) {
    this.editId = n.id; this.formError = '';
    this.form = { title: n.title, estimatedPrice: n.estimatedPrice, status: n.status, priority: n.priority };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  save() {
    if (!this.form.title || !this.form.estimatedPrice) { this.formError = 'Titre et prix estimé sont requis.'; return; }
    this.saving = true; this.formError = '';
    const payload = { ...this.form, estimatedPrice: parseFloat(this.form.estimatedPrice) };
    const req = this.editId ? this.needService.update(this.editId, payload) : this.needService.create(payload);
    req.subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.load(true);
      },
      error: (err) => {
        this.formError = err.error?.message || 'Une erreur est survenue';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteNeed(id: number) {
    if (!confirm('Supprimer ce besoin ?')) return;
    this.needService.delete(id).subscribe(() => this.load(true));
  }

  cycleStatus(n: Need) {
    const order: Need['status'][] = ['PENDING', 'IN_PROGRESS', 'FULFILLED'];
    const next = order[(order.indexOf(n.status) + 1) % order.length];
    this.needService.updateStatus(n.id, next).subscribe(updated => {
      const idx = this.needs.findIndex(x => x.id === n.id);
      if (idx !== -1) this.needs[idx] = updated;
      this.applyFilters();
    });
  }

  getBudgetByPriority(p: string) { return this.needs.filter(n => n.priority === p).reduce((s, n) => s + n.estimatedPrice, 0); }
  getPriorityLabel(p: string) { return PRIORITY_LABELS[p] || p; }
  getPriorityColor(p: string) { return PRIORITY_COLORS[p] || '#94a3b8'; }
  getPriorityBg(p: string) { return PRIORITY_BG[p] || '#334155'; }
  getStatusLabel(s: string) { return STATUS_LABELS[s] || s; }
  getStatusColor(s: string) { return STATUS_COLORS[s] || '#94a3b8'; }
  getStatusBg(s: string) { return STATUS_BG[s] || '#334155'; }
}
