import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="workspace">
      <aside class="sidebar" [class.closed]="!sidebarOpen()">
        <a class="brand" routerLink="/app"><span class="mark">P</span><span>polymind<span class="dim">.ai</span><small>DECISION INTELLIGENCE</small></span></a>
        <div class="nav-caption">WORKSPACE</div>
        <nav>
          <a routerLink="/app/overview" routerLinkActive="active"><span>▦</span> Resumen</a>
          <a routerLink="/app/decisions" routerLinkActive="active"><span>◇</span> Decisiones</a>
        </nav>
        <div class="side-bottom">
          <div class="ai-status" [class.offline]="health()==='offline'" aria-live="polite"><i></i><div><b>Multi-agent system</b><small>{{healthLabel()}}</small></div></div>
          <div class="profile"><div class="avatar">{{ initials() }}</div><div class="profile-info"><b>{{ userName() }}</b><small>{{ userEmail() }}</small></div><button aria-label="Cerrar sesión" (click)="logout()">↗</button></div>
        </div>
      </aside>
      <main class="main-area">
        <header><button class="mobile-menu" type="button" aria-label="Abrir o cerrar el menú" [attr.aria-expanded]="sidebarOpen()" (click)="sidebarOpen.set(!sidebarOpen())">☰</button><div class="breadcrumb">POLYMIND <span>/</span> <b>{{ section() }}</b></div><div class="header-right"><span class="live"><i></i> Workspace activo</span><div class="header-avatar">{{ initials() }}</div></div></header>
        <section class="page-content"><router-outlet /></section>
      </main>
    </div>
  `,
  styles:[`
    :host{display:block;min-height:100vh}.workspace{min-height:100vh;background:#f5f7f4;color:#1d2c25}.sidebar{position:fixed;inset:0 auto 0 0;width:252px;background:#102b25;color:#f4f7f2;padding:27px 19px 18px;display:flex;flex-direction:column;z-index:20;transition:transform .25s}.brand{display:flex;align-items:center;gap:11px;text-decoration:none;color:#f5f8f5;font-weight:800;font-size:19px;letter-spacing:-.7px;padding:0 7px 43px}.mark{width:36px;height:36px;border-radius:11px;background:#c5f277;color:#17332b;display:grid;place-items:center;font-weight:900}.dim{color:#c5f277}.brand small{display:block;color:#80988f;font-size:8px;letter-spacing:1.5px;margin-top:3px}.nav-caption{font-size:9px;letter-spacing:1.6px;font-weight:800;color:#718b80;padding:0 12px 12px}.sidebar nav{display:grid;gap:5px}.sidebar nav a{display:flex;align-items:center;gap:12px;padding:12px;border-radius:9px;color:#aec0b8;text-decoration:none;font-size:12px;font-weight:600;transition:.2s}.sidebar nav a span{font-size:17px;width:18px;text-align:center}.sidebar nav a:hover,.sidebar nav a.active{background:#ffffff12;color:#d6f69b}.side-bottom{margin-top:auto}.ai-status{display:flex;align-items:center;gap:11px;padding:13px 11px;border:1px solid #ffffff18;border-radius:11px;margin-bottom:15px}.ai-status i,.live i{width:7px;height:7px;border-radius:50%;background:#a9df65;box-shadow:0 0 0 4px #a9df651c}.ai-status b,.ai-status small,.profile b,.profile small{display:block}.ai-status.offline i{background:#e0715f;box-shadow:0 0 0 4px #e0715f22}.ai-status b{font-size:10px}.ai-status small{font-size:9px;color:#8ba398;margin-top:4px}.profile{border-top:1px solid #ffffff1a;padding:17px 4px 0;display:flex;align-items:center;gap:10px}.avatar,.header-avatar{width:34px;height:34px;border-radius:11px;background:#d8ebc5;color:#244d39;display:grid;place-items:center;font-weight:800;font-size:11px}.profile-info{min-width:0;flex:1}.profile b{font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.profile small{font-size:9px;color:#8ba398;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.profile button{border:0;background:transparent;color:#96ada2;cursor:pointer;font-size:17px}.main-area{margin-left:252px;min-height:100vh}header{height:68px;background:#fff;border-bottom:1px solid #e9eee9;display:flex;align-items:center;justify-content:space-between;padding:0 36px;position:sticky;top:0;z-index:10}.breadcrumb{font-size:9px;font-weight:800;letter-spacing:1.5px;color:#9aa59e}.breadcrumb span{margin:0 10px;color:#d0d8d2}.breadcrumb b{color:#43544b}.header-right{display:flex;align-items:center;gap:18px}.live{font-size:10px;color:#7c8981;display:flex;align-items:center;gap:8px}.live i{width:6px;height:6px}.header-avatar{width:31px;height:31px}.page-content{padding:34px 38px 55px;max-width:1500px;margin:0 auto}.mobile-menu{display:none}@media(max-width:850px){.sidebar{transform:translateX(-100%)}.sidebar:not(.closed){transform:translateX(0);box-shadow:20px 0 50px #071b1740}.main-area{margin-left:0}header{padding:0 18px}.mobile-menu{display:block;border:0;background:none;font-size:20px;color:#274137;cursor:pointer}.breadcrumb{margin-right:auto;margin-left:12px}.page-content{padding:24px 18px}}
  `]
})
export class DashboardLayout {
  private readonly auth=inject(AuthService);
  private readonly router=inject(Router);
  readonly sidebarOpen=signal(false);
  readonly userName=()=>this.auth.currentUser()?.name || 'Mi cuenta';
  readonly userEmail=()=>this.auth.currentUser()?.email || 'Sesión iniciada';
  readonly initials=()=>this.userName().split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
  readonly section=()=>this.router.url.includes('decisions')?'DECISIONES':'RESUMEN';
  /** Real backend state from /health instead of a static label. */
  readonly health=signal<'checking'|'ai'|'rules'|'offline'>('checking');
  constructor(){
    if(this.auth.isAuthenticated()&&!this.auth.currentUser())void this.auth.loadUser().catch(()=>undefined);
    inject(ApiService).health().subscribe({
      next:status=>this.health.set(status.database!=='connected'?'offline':status.ai_configured?'ai':'rules'),
      error:()=>this.health.set('offline')
    });
  }
  healthLabel(){
    switch(this.health()){
      case 'ai':return 'Agentes con IA activos';
      case 'rules':return 'Agentes en modo reglas';
      case 'offline':return 'Servicio no disponible';
      default:return 'Verificando servicios...';
    }
  }
  logout(){this.auth.logout();}
}
