import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center" style="background:#0f172a">
      <div class="w-full max-w-md p-8 rounded-2xl" style="background:#1e293b;border:1px solid #334155">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:#4f46e5">
            <svg class="w-6 h-6" style="color:white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="font-bold text-lg" style="color:#f1f5f9">BudgetSphere</p>
            <p class="text-xs" style="color:#64748b">Finance Personnelle</p>
          </div>
        </div>

        <h2 class="text-2xl font-bold mb-2" style="color:#f1f5f9">Connexion</h2>
        <p class="text-sm mb-6" style="color:#94a3b8">Bienvenue ! Connectez-vous à votre compte.</p>

        <div *ngIf="error" class="mb-4 p-3 rounded-xl text-sm" style="background:rgba(239,68,68,0.1);color:#f87171">
          {{ error }}
        </div>

        <form (ngSubmit)="login()" class="space-y-4">
          <div>
            <label class="text-sm mb-1 block" style="color:#94a3b8">Email</label>
            <input [(ngModel)]="email" name="email" type="email" placeholder="vous@exemple.com"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style="background:#0f172a;border:1px solid #334155;color:#f1f5f9"/>
          </div>
          <div>
            <label class="text-sm mb-1 block" style="color:#94a3b8">Mot de passe</label>
            <input [(ngModel)]="password" name="password" type="password" placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style="background:#0f172a;border:1px solid #334155;color:#f1f5f9"/>
          </div>
          <button type="submit" [disabled]="loading"
            class="w-full py-3 rounded-xl font-medium text-sm transition-all"
            [style.opacity]="loading ? '0.6' : '1'"
            style="background:#4f46e5;color:white">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <p class="text-center text-sm mt-6" style="color:#64748b">
          Pas encore de compte ?
          <a routerLink="/register" style="color:#818cf8;text-decoration:none"> S'inscrire</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';
  loading = false;

  login() {
    this.loading = true;
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.message || 'Email ou mot de passe incorrect';
        this.loading = false;
      }
    });
  }
}
