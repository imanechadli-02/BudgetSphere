import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .card { background:#1e293b; border:1px solid #334155; border-radius:16px; }
    .input-field { background:#0f172a; border:1px solid #334155; color:#f1f5f9; border-radius:12px; padding:10px 16px; font-size:14px; width:100%; }
    .input-field:focus { outline:none; border-color:#6366f1; }
    .input-field option { background:#1e293b; }
    .nav-link { color:#94a3b8; display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; font-size:14px; font-weight:500; transition:all 0.2s; cursor:pointer; }
    .nav-link:hover { background:#1e293b; color:#f1f5f9; }
    .nav-active { background:#dc2626 !important; color:white !important; }
    tr:hover td { background:rgba(255,255,255,0.02); }
  `],
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  users: User[] = [];
  filtered: User[] = [];
  loading = false;
  searchQuery = '';
  filterStatus = '';
  currentDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // Modal confirm
  showConfirm = false;
  confirmTitle = '';
  confirmMsg = '';
  confirmDanger = false;
  private pendingAction: (() => void) | null = null;

  // Modal change role
  showRoleModal = false;
  selectedUser: User | null = null;
  newRole = 'USER';
  roleError = '';

  private barChart: any = null;
  private roleChart: any = null;

  get currentUser() { return this.authService.getUser(); }
  get initials() {
    const u = this.currentUser;
    return `${u?.firstName?.[0] ?? ''}${u?.lastName?.[0] ?? ''}`.toUpperCase();
  }
  get totalUsers() { return this.users.length; }
  get activeUsers() { return this.users.filter(u => u.enabled).length; }
  get inactiveUsers() { return this.users.filter(u => !u.enabled).length; }
  get adminCount() { return this.users.filter(u => u.role === 'ADMIN').length; }

  ngOnInit() { this.load(); }
  ngOnDestroy() { this.barChart?.destroy(); this.roleChart?.destroy(); }

  load() {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: users => {
        this.users = users;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.renderCharts(), 100);
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters() {
    let result = [...this.users];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(u =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    if (this.filterStatus === 'active') result = result.filter(u => u.enabled);
    if (this.filterStatus === 'inactive') result = result.filter(u => !u.enabled);
    this.filtered = result;
  }

  resetFilters() { this.searchQuery = ''; this.filterStatus = ''; this.applyFilters(); }

  getInitials(u: User) {
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
  }

  askToggle(u: User) {
    this.confirmTitle = u.enabled ? 'Désactiver le compte' : 'Activer le compte';
    this.confirmMsg = `${u.enabled ? 'Désactiver' : 'Activer'} le compte de ${u.firstName} ${u.lastName} ?`;
    this.confirmDanger = u.enabled;
    this.pendingAction = () => this.adminService.toggleUser(u.id).subscribe(() => this.load());
    this.showConfirm = true;
  }

  askDelete(u: User) {
    this.confirmTitle = 'Supprimer l\'utilisateur';
    this.confirmMsg = `Supprimer définitivement ${u.firstName} ${u.lastName} ? Cette action est irréversible.`;
    this.confirmDanger = true;
    this.pendingAction = () => this.adminService.deleteUser(u.id).subscribe(() => this.load());
    this.showConfirm = true;
  }

  confirm() { this.pendingAction?.(); this.showConfirm = false; this.pendingAction = null; }
  cancelConfirm() { this.showConfirm = false; this.pendingAction = null; }

  openRoleModal(u: User) {
    this.selectedUser = u;
    this.newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    this.roleError = '';
    this.showRoleModal = true;
  }

  closeRoleModal() { this.showRoleModal = false; this.selectedUser = null; }

  confirmRoleChange() {
    if (!this.selectedUser) return;
    this.adminService.changeRole(this.selectedUser.id, this.newRole).subscribe({
      next: () => { this.closeRoleModal(); this.load(); },
      error: (err) => { this.roleError = err.error?.message || 'Erreur'; }
    });
  }

  logout() { this.authService.logout(); this.router.navigate(['/login']); }

  renderCharts() {
    const win = window as any;
    if (!win.Chart) return;
    this.barChart?.destroy();
    this.roleChart?.destroy();

    const barEl = document.getElementById('adminBarChart') as HTMLCanvasElement;
    const roleEl = document.getElementById('roleChart') as HTMLCanvasElement;
    if (!barEl || !roleEl) return;

    this.barChart = new win.Chart(barEl.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Fév','Mar','Avr','Mai','Jun','Jul','Août','Sep','Oct','Nov','Déc','Jan'],
        datasets: [{ label: 'Inscriptions', data: [45,62,58,80,95,110,88,102,120,98,135,124], backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 6 }]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#64748b' }, grid: { display: false } }, y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } } } }
    });

    this.roleChart = new win.Chart(roleEl.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Utilisateurs', 'Admins'],
        datasets: [{ data: [this.totalUsers - this.adminCount, this.adminCount], backgroundColor: ['#6366f1', '#ef4444'], borderWidth: 0 }]
      },
      options: { responsive: true, cutout: '70%', plugins: { legend: { display: false } } }
    });
  }
}
