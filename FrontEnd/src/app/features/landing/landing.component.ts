import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, NgFor],
  template: `
    <div style="background:#0f172a;color:#f1f5f9;font-family:'Inter',sans-serif;min-height:100vh">

      <!-- Navbar -->
      <nav style="border-bottom:1px solid #1e293b;background:rgba(15,23,42,0.9);backdrop-filter:blur(12px);position:sticky;top:0;z-index:50">
        <div style="max-width:1200px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:64px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;background:#4f46e5;border-radius:10px;display:flex;align-items:center;justify-content:center">
              <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span style="font-weight:700;font-size:18px">BudgetSphere</span>
          </div>
          <div style="display:flex;gap:12px">
            <a routerLink="/login"
               style="padding:8px 20px;border-radius:10px;font-size:14px;font-weight:500;color:#94a3b8;border:1px solid #334155;text-decoration:none"
               onmouseover="this.style.color='#f1f5f9';this.style.borderColor='#4f46e5'"
               onmouseout="this.style.color='#94a3b8';this.style.borderColor='#334155'">
              Connexion
            </a>
            <a routerLink="/register"
               style="padding:8px 20px;border-radius:10px;font-size:14px;font-weight:500;color:white;background:#4f46e5;text-decoration:none"
               onmouseover="this.style.background='#4338ca'"
               onmouseout="this.style.background='#4f46e5'">
              S'inscrire
            </a>
          </div>
        </div>
      </nav>

      <!-- Hero -->
      <section style="max-width:1200px;margin:0 auto;padding:100px 24px 80px;text-align:center">
        <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(79,70,229,0.15);border:1px solid rgba(79,70,229,0.3);border-radius:999px;padding:6px 16px;margin-bottom:32px">
          <span style="width:6px;height:6px;background:#818cf8;border-radius:50%;display:inline-block"></span>
          <span style="font-size:13px;color:#818cf8;font-weight:500">Gérez vos finances intelligemment</span>
        </div>
        <h1 style="font-size:clamp(36px,6vw,64px);font-weight:800;line-height:1.1;margin-bottom:24px;letter-spacing:-1px">
          Prenez le contrôle de<br>
          <span style="background:linear-gradient(135deg,#818cf8,#4f46e5);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
            vos finances
          </span>
        </h1>
        <p style="font-size:18px;color:#94a3b8;max-width:560px;margin:0 auto 48px;line-height:1.7">
          Suivez vos dépenses, atteignez vos objectifs d'épargne et visualisez votre santé financière en temps réel.
        </p>
        <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
          <a routerLink="/register"
             style="padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;color:white;background:#4f46e5;text-decoration:none;display:inline-flex;align-items:center;gap:8px"
             onmouseover="this.style.background='#4338ca';this.style.transform='translateY(-1px)'"
             onmouseout="this.style.background='#4f46e5';this.style.transform='translateY(0)'">
            Commencer gratuitement
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </a>
          <a routerLink="/login"
             style="padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;color:#94a3b8;border:1px solid #334155;text-decoration:none"
             onmouseover="this.style.color='#f1f5f9';this.style.borderColor='#4f46e5'"
             onmouseout="this.style.color='#94a3b8';this.style.borderColor='#334155'">
            Se connecter
          </a>
        </div>
      </section>

      <!-- Stats -->
      <section style="border-top:1px solid #1e293b;border-bottom:1px solid #1e293b;background:#0d1526">
        <div style="max-width:1200px;margin:0 auto;padding:40px 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:32px;text-align:center">
          <div *ngFor="let s of stats">
            <p style="font-size:32px;font-weight:800;color:#818cf8">{{ s.value }}</p>
            <p style="font-size:13px;color:#64748b;margin-top:4px">{{ s.label }}</p>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section style="max-width:1200px;margin:0 auto;padding:80px 24px">
        <h2 style="text-align:center;font-size:32px;font-weight:700;margin-bottom:12px">Tout ce dont vous avez besoin</h2>
        <p style="text-align:center;color:#64748b;margin-bottom:56px;font-size:15px">Une suite complète pour maîtriser votre budget</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">
          <div *ngFor="let f of features"
               style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:28px;transition:border-color 0.2s"
               onmouseover="this.style.borderColor='#4f46e5'"
               onmouseout="this.style.borderColor='#334155'">
            <div style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:20px"
                 [style.background]="f.bg">{{ f.icon }}</div>
            <h3 style="font-size:16px;font-weight:600;margin-bottom:8px;color:#f1f5f9">{{ f.title }}</h3>
            <p style="font-size:14px;color:#64748b;line-height:1.6">{{ f.desc }}</p>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section style="padding:0 24px 80px">
        <div style="max-width:640px;margin:0 auto;text-align:center;background:linear-gradient(135deg,rgba(79,70,229,0.2),rgba(99,102,241,0.1));border:1px solid rgba(79,70,229,0.3);border-radius:24px;padding:60px 40px">
          <h2 style="font-size:32px;font-weight:700;margin-bottom:16px">Prêt à commencer ?</h2>
          <p style="color:#94a3b8;margin-bottom:36px;font-size:15px">Rejoignez BudgetSphere et transformez votre rapport à l'argent.</p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
            <a routerLink="/register"
               style="padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;color:white;background:#4f46e5;text-decoration:none"
               onmouseover="this.style.background='#4338ca'"
               onmouseout="this.style.background='#4f46e5'">
              Créer un compte
            </a>
            <a routerLink="/login"
               style="padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;color:#94a3b8;border:1px solid #334155;text-decoration:none"
               onmouseover="this.style.color='#f1f5f9';this.style.borderColor='#818cf8'"
               onmouseout="this.style.color='#94a3b8';this.style.borderColor='#334155'">
              Se connecter
            </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer style="border-top:1px solid #1e293b;padding:24px;text-align:center">
        <p style="font-size:13px;color:#475569">© 2025 BudgetSphere — Finance Personnelle</p>
      </footer>

    </div>
  `
})
export class LandingComponent {
  stats = [
    { value: '50K+', label: 'Utilisateurs actifs' },
    { value: '2M€+', label: 'Dépenses suivies' },
    { value: '98%', label: 'Satisfaction client' },
    { value: '4.9★', label: 'Note moyenne' },
  ];

  features = [
    { icon: '📊', bg: 'rgba(79,70,229,0.15)', title: 'Tableau de bord', desc: "Visualisez vos finances en un coup d'œil avec des graphiques clairs et intuitifs." },
    { icon: '💸', bg: 'rgba(248,113,113,0.15)', title: 'Suivi des dépenses', desc: 'Catégorisez et analysez chaque dépense pour identifier où va votre argent.' },
    { icon: '🎯', bg: 'rgba(74,222,128,0.15)', title: "Objectifs d'épargne", desc: 'Définissez des objectifs et suivez votre progression mois après mois.' },
    { icon: '🔄', bg: 'rgba(250,204,21,0.15)', title: 'Transactions', desc: 'Historique complet de toutes vos transactions avec filtres avancés.' },
    { icon: '📈', bg: 'rgba(129,140,248,0.15)', title: 'Analyses & Rapports', desc: 'Tendances sur 6 mois, répartition par catégorie et santé financière.' },
    { icon: '🔒', bg: 'rgba(99,102,241,0.15)', title: 'Sécurisé', desc: 'Vos données sont chiffrées et protégées avec les meilleures pratiques de sécurité.' },
  ];
}
