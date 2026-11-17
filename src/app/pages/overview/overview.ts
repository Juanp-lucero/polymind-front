import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Decision, Statistics } from '../../core/api.service';

@Component({
  selector: 'app-overview-page',
  imports: [DatePipe, RouterLink],
  template: `
    <div class="welcome-row">
      <div><span class="eyebrow">CENTRO DE COMANDO</span><h1>Buenos días, {{ firstName() }} <span>✳</span></h1><p>Este es el pulso de tus decisiones estratégicas.</p></div>
      <a class="new-btn" routerLink="/app/decisions/new">＋ Nueva decisión</a>
    </div>
    @if (error()) { <div class="notice">{{ error() }}</div> }
    <div class="stats-grid">
      <article class="stat-card"><div class="stat-icon purple">◇</div><span>DECISIONES TOTALES</span><strong>{{ metric('total_decisions', 'total') }}</strong><small>En tu espacio de trabajo</small></article>
      <article class="stat-card"><div class="stat-icon green">✳</div><span>ANÁLISIS REALIZADOS</span><strong>{{ metric('completed_analyses', 'analyses') }}</strong><small>Evaluaciones multiagente</small></article>
      <article class="stat-card"><div class="stat-icon amber">◷</div><span>PENDIENTES</span><strong>{{ metric('pending_decisions', 'pending') }}</strong><small>Decisiones por evaluar</small></article>
      <article class="stat-card featured"><div class="stat-icon light">⌁</div><span>AGENTES ACTIVOS</span><strong>04 <small>/ 04</small></strong><small>Motor de análisis especializado</small></article>
    </div>
    <div class="content-grid">
      <section class="panel">
        <div class="panel-head"><div><span class="eyebrow">SEGUIMIENTO</span><h2>Decisiones recientes</h2></div><a routerLink="/app/decisions">Ver todas ↗</a></div>
        @if (loading()) { <div class="empty">Cargando decisiones...</div> }
        @else if (decisions().length === 0) {
          <div class="empty-state"><div>◇</div><b>Tu espacio empieza aquí</b><p>Crea una decisión para comenzar a comparar alternativas con tus agentes.</p><a routerLink="/app/decisions/new">Crear primera decisión ↗</a></div>
        } @else {
          <div class="decision-list">
            @for (item of decisions().slice(0, 5); track item.id) {
              <a class="decision-row" [routerLink]="['/app/decisions', item.id]"><div class="decision-symbol">◇</div><div class="decision-info"><b>{{ item.title }}</b><small>{{ item.alternatives.length }} alternativas · {{ item.created_at | date:'dd MMM yyyy' }}</small></div><span class="status" [class.done]="item.status === 'completed'">{{ status(item.status) }}</span><span class="arrow">↗</span></a>
            }
          </div>
        }
      </section>
      <section class="panel agents">
        <div class="panel-head"><div><span class="eyebrow">INTELIGENCIA COLECTIVA</span><h2>Red de agentes</h2></div><span class="online">● ONLINE</span></div>
        @for (agent of agentCards; track agent.name) {
          <div class="agent-row"><div class="agent-icon">{{ agent.icon }}</div><div><b>{{ agent.name }}</b><small>{{ agent.desc }}</small></div><i></i></div>
        }
        <div class="weights-note"><span>Motor ponderado</span><b>30 / 30 / 20 / 20</b></div>
      </section>
    </div>
    <div class="bottom-banner"><div><span class="eyebrow">DECIDE CON PERSPECTIVA</span><h2>Una buena decisión nace de mejores preguntas.</h2><p>Explora escenarios desde cuatro perspectivas especializadas y encuentra el camino con mayor fundamento.</p></div><a routerLink="/app/decisions/new">Evaluar una idea <span>↗</span></a></div>
  `,
  styles: [`
    :host{display:block}.welcome-row{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px;gap:15px}.eyebrow{font-size:9px;letter-spacing:1.7px;color:#839b71;font-weight:850}.welcome-row h1{font-size:29px;letter-spacing:-1.1px;margin:9px 0 7px;color:#1b2b24}.welcome-row h1 span{color:#91b65d;font-size:22px}.welcome-row p{margin:0;color:#8a968f;font-size:12px}.new-btn{background:#1b4035;color:#fff;padding:12px 17px;border-radius:9px;font-size:11px;font-weight:750;text-decoration:none;white-space:nowrap}.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.stat-card{background:white;border:1px solid #e9eee8;border-radius:13px;padding:17px 18px;min-height:145px;position:relative}.stat-icon{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;font-size:17px;margin-bottom:15px}.purple{background:#f0edff;color:#7563c5}.green{background:#eaf5dd;color:#668b3f}.amber{background:#fff3da;color:#c28b30}.stat-card>span{display:block;font-size:8px;letter-spacing:1px;font-weight:850;color:#87938b}.stat-card>strong{display:block;font-size:29px;letter-spacing:-1px;margin-top:6px;color:#203329}.stat-card>small{display:block;color:#a0aaa3;font-size:9px;margin-top:4px}.featured{background:#1d4035;border-color:#1d4035;color:white}.featured>span{color:#b3c9bd}.featured>strong{color:#f4f9ef}.featured>strong small{display:inline;color:#9fb5a8;font-size:11px}.featured>small{color:#a7c0b0}.light{background:#ffffff18;color:#d8f6a4}.content-grid{display:grid;grid-template-columns:1.55fr 1fr;gap:16px;margin-top:19px}.panel{background:#fff;border:1px solid #e9eee8;border-radius:13px;padding:20px;min-width:0}.panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:17px}.panel-head h2{font-size:16px;letter-spacing:-.4px;margin:5px 0 0;color:#203329}.panel-head>a{font-size:10px;color:#567b4b;text-decoration:none;font-weight:800}.online{font-size:8px;color:#779a59;background:#eff7e7;border-radius:20px;padding:6px 9px;font-weight:850}.decision-row{display:flex;gap:12px;align-items:center;padding:12px 0;border-top:1px solid #f0f3ef;text-decoration:none;color:inherit}.decision-symbol{height:34px;width:34px;border-radius:10px;background:#f0f5eb;color:#72934d;display:grid;place-items:center}.decision-info{flex:1;min-width:0}.decision-info b,.decision-info small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.decision-info b{font-size:11px}.decision-info small{font-size:9px;color:#99a39c;margin-top:5px}.status{font-size:8px;background:#fff5df;color:#aa812f;border-radius:20px;padding:6px 8px}.status.done{background:#ecf6e6;color:#648744}.arrow{color:#a3ada6}.agent-row{display:flex;align-items:center;gap:11px;padding:12px 0;border-top:1px solid #f0f3ef}.agent-icon{width:34px;height:34px;border-radius:10px;background:#edf3eb;color:#547b47;display:grid;place-items:center}.agent-row b,.agent-row small{display:block}.agent-row b{font-size:10px}.agent-row small{font-size:9px;color:#9aa49d;margin-top:4px}.agent-row>div:nth-child(2){flex:1}.agent-row i{width:6px;height:6px;background:#9bc86a;border-radius:50%}.weights-note{border-radius:9px;background:#f5f8f2;padding:11px 12px;display:flex;justify-content:space-between;color:#81907f;font-size:9px;margin-top:8px}.weights-note b{color:#395a3f}.empty{padding:30px 0;text-align:center;color:#98a39b;font-size:11px}.empty-state{text-align:center;padding:25px 10px 30px}.empty-state>div{margin:auto auto 12px;width:45px;height:45px;border-radius:14px;background:#eef5e9;color:#6f954b;display:grid;place-items:center;font-size:23px}.empty-state b{font-size:12px}.empty-state p{color:#98a39b;font-size:10px;max-width:270px;margin:8px auto 15px;line-height:1.6}.empty-state a{font-size:10px;color:#527747;text-decoration:none;font-weight:850}.bottom-banner{margin-top:18px;border-radius:14px;padding:23px 25px;background:linear-gradient(105deg,#e9f1df,#f3f6ed);display:flex;justify-content:space-between;align-items:center;gap:18px}.bottom-banner h2{font-size:18px;letter-spacing:-.7px;margin:7px 0}.bottom-banner p{color:#829086;font-size:10px;margin:0}.bottom-banner a{padding:11px 14px;border-radius:9px;background:#294b3d;color:#fff;text-decoration:none;font-size:10px;font-weight:750;white-space:nowrap}.bottom-banner a span{margin-left:10px}.notice{padding:11px;background:#fff3ed;color:#9e4937;border-radius:8px;font-size:11px;margin-bottom:12px}@media(max-width:1050px){.stats-grid{grid-template-columns:repeat(2,1fr)}.content-grid{grid-template-columns:1fr}}@media(max-width:550px){.welcome-row{align-items:flex-start;flex-direction:column}.welcome-row h1{font-size:25px}.stats-grid{gap:9px}.stat-card{padding:13px;min-height:132px}.bottom-banner{align-items:flex-start;flex-direction:column}}
  `],
})
export class OverviewPage {
  private readonly api = inject(ApiService);
  readonly decisions = signal<Decision[]>([]);
  readonly stats = signal<Statistics>({});
  readonly loading = signal(true);
  readonly error = signal('');
  readonly agentCards = [
    { name: 'Analista financiero', desc: 'Costos y viabilidad', icon: '＄' },
    { name: 'Analista tecnológico', desc: 'Capacidad e innovación', icon: '⌘' },
    { name: 'Impacto humano', desc: 'Personas y adopción', icon: '♧' },
    { name: 'Gestión de riesgos', desc: 'Riesgos y mitigación', icon: '◇' },
  ];
  readonly firstName = () => localStorage.getItem('polymind_user_name')?.split(' ')[0] || 'de nuevo';

  constructor() {
    this.api.listDecisions().subscribe({
      next: data => { this.decisions.set(data); this.loading.set(false); },
      error: error => { this.error.set(error.message); this.loading.set(false); },
    });
    this.api.statistics().subscribe({ next: data => this.stats.set(data), error: () => undefined });
  }

  metric(...keys: string[]): number | string {
    const data = this.stats() as Record<string, unknown>;
    for (const key of keys) if (typeof data[key] === 'number' || typeof data[key] === 'string') return data[key] as number | string;
    if (keys.includes('total_decisions')) return this.decisions().length;
    if (keys.includes('pending_decisions')) return this.decisions().filter(item => item.status === 'pending').length;
    if (keys.includes('completed_analyses')) return data['total_analyses'] as number ?? '—';
    return '—';
  }
  status(value: string): string {
    return value === 'completed' ? 'Completada' : value === 'in_progress' ? 'En análisis' : value === 'cancelled' ? 'Cancelada' : 'Pendiente';
  }
}
