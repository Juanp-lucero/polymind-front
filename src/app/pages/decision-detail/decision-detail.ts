import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AgentResult, ApiService, Analysis, CompleteAnalysis, Decision } from '../../core/api.service';
import { agentLabel, evaluationSource, findDisagreements, findInformationGaps, visibleObservations } from './analysis-insights';

@Component({
  selector:'app-decision-detail-page',
  imports:[DatePipe,DecimalPipe,RouterLink],
  template:`
    <a class="back" routerLink="/app/decisions">← Volver al portafolio</a>
    @if(loading()){<div class="loading">Cargando escenario...</div>}
    @else if(error()&&!decision()){<div class="alert">{{error()}}</div>}
    @else if(decision();as item){
      <div class="title-row"><div><span class="eyebrow">DECISIÓN #{{item.id.toString().padStart(3,'0')}}</span><h1>{{item.title}}</h1><p>{{item.description}}</p></div><div class="title-actions"><span class="status" [class.done]="item.status==='completed'">{{status(item.status)}}</span><a class="edit-link" [routerLink]="['/app/decisions', item.id, 'edit']">Editar</a>@if(confirmingDelete()){<button class="delete-link danger" (click)="deleteDecision()" [disabled]="deleting()">{{deleting()?'Eliminando...':'Confirmar eliminación'}}</button><button class="delete-link" (click)="confirmingDelete.set(false)">Cancelar</button>}@else{<button class="delete-link" (click)="confirmingDelete.set(true)">Eliminar</button>}</div></div>
      <div class="scenario-grid"><section class="panel scenario"><span class="eyebrow">CONTEXTO</span><p>{{item.context||'No se agregó contexto adicional.'}}</p><div class="subhead">Alternativas consideradas</div><div class="chips">@for(alt of item.alternatives;track alt){<span>{{alt}}</span>}</div></section><section class="run-card"><div class="run-icon">✳</div><span class="eyebrow">ANÁLISIS MULTIAGENTE</span><h3>Convierte el escenario en perspectiva.</h3><p>Cuatro agentes especializados evaluarán tus alternativas y el analista generará una recomendación ponderada.</p>@if(gaps().length){<div class="gaps"><b>Para un análisis más preciso:</b>@for(gap of gaps();track gap){<div>• {{gap}}</div>}<a [routerLink]="['/app/decisions', item.id, 'edit']">Completar información →</a></div>}<button (click)="runAnalysis()" [disabled]="analyzing()">{{analyzing()?'Ejecutando agentes...':'Ejecutar análisis'}} <span>↗</span></button>@if(analyzing()){<small class="progress-note">Conectando con el motor gRPC...</small>}</section></div>
      @if(error()){<div class="alert">{{error()}}</div>}
      <section class="history panel"><div class="section-head"><div><span class="eyebrow">HISTORIAL</span><h2>Análisis realizados</h2></div><span class="muted">{{analyses().length}} registros</span></div>
        @if(analyses().length===0){<div class="empty">Todavía no hay análisis. Ejecuta el primero para ver la evaluación de tus agentes.</div>}
        @else{<div class="history-list">@for(analysis of analyses();track analysis.id){<button class="history-row" (click)="loadComplete(analysis)"><div class="history-mark">✳</div><div class="history-info"><b>Análisis #{{analysis.id}}</b><small>{{analysis.created_at|date:'dd MMM yyyy, HH:mm'}} · {{analysis.status}}</small></div><span>Ver resultados ↗</span></button>}</div>}
      </section>
      @if(complete();as report){
        <section class="results">
          <div class="results-head"><div><span class="eyebrow">RESULTADO DEL MOTOR</span><h2>Informe de decisión</h2><p>Evaluación generada con cuatro perspectivas especializadas.</p></div><span class="complete-pill">✓ Análisis completado</span></div>
          <article class="report panel"><div class="report-label">SÍNTESIS EJECUTIVA</div><div class="report-text">{{report.analysis}}</div><div class="recommendations"><b>Recomendaciones</b>@for(rec of report.recommendations;track rec){<div><span>✓</span>{{rec}}</div>}</div></article>
          <div class="section-head agent-heading"><div><span class="eyebrow">PERSPECTIVAS ESPECIALIZADAS</span><h2>Evaluación por agente</h2></div></div>
          <div class="agents-grid">@for(agent of report.agent_results;track agent.agent){<article class="agent-card panel"><div class="agent-top"><span class="agent-bullet">✳</span><b>{{agentShort(agent.agent)}}</b>@switch(source(agent)){@case('ai'){<span class="source-pill ai" title="Evaluación generada con IA y validada">IA</span>}@case('rules'){<span class="source-pill rules" title="La IA no estaba disponible; se usaron reglas">Reglas</span>}}</div><p>{{agent.analysis}}</p>@if(agent.alternative_evaluations?.length){<div class="agent-scores">@for(evaluation of agent.alternative_evaluations;track evaluation.alternative){<div class="score-row"><div class="score-line"><span>{{evaluation.alternative}}</span><b>{{evaluation.score|number:'1.1-1'}}/10</b></div>@if(evaluation.justification){<p class="justification">{{evaluation.justification}}</p>}</div>}</div>}@if(agent.recommendations?.length){<small class="mini-label">RECOMENDACIONES</small>@for(rec of agent.recommendations;track rec){<div class="mini-line">• {{rec}}</div>}}@if(observations(agent).length){<small class="mini-label">OBSERVACIONES</small>@for(obs of observations(agent);track obs){<div class="mini-line">• {{obs}}</div>}}</article>}</div>
          <section class="panel comparison"><div class="section-head"><div><span class="eyebrow">DECISIÓN BASADA EN CRITERIOS</span><h2>Comparación ponderada</h2></div></div>
            @if(report.alternative_comparison.length){@for(item of sortedComparison();track item.alternative;let i=$index){<div class="comparison-row"><span class="rank">{{i+1}}</span><div class="comparison-info"><div><b>{{item.alternative}}</b><strong>{{item.weighted_score|number:'1.2-2'}} <small>/ 10</small></strong></div><div class="bar"><i [style.width.%]="item.weighted_score*10"></i></div><div class="criteria">@for(entry of entries(item.criteria);track entry[0]){<span>{{agentShort(entry[0])}}: {{entry[1]}}/10</span>}</div></div></div>}}
            @if(disagreements().length){<div class="disagreements" role="note"><b>⚠ Los agentes no coinciden</b>@for(item of disagreements();track item.alternative){<div>En <strong>{{item.alternative}}</strong>, {{agentShort(item.highest.agent)}} la califica con {{item.highest.score|number:'1.0-1'}}/10, pero {{agentShort(item.lowest.agent)}} con {{item.lowest.score|number:'1.0-1'}}/10. Revisa esa perspectiva antes de decidir.</div>}</div>}
            <div class="weights"><b>Ponderaciones del analista</b>@for(entry of entries(report.weights);track entry[0]){<span>{{agentShort(entry[0])}} <strong>{{entry[1]*100|number:'1.0-0'}}%</strong></span>}</div>
          </section>
        </section>
      }
    }
  `,
  styles:[`
    :host{display:block}.back{font-size:10px;color:#6c8569;text-decoration:none;font-weight:800}.loading,.empty{padding:35px;text-align:center;color:#97a198;font-size:11px}.title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin:22px 0}.eyebrow{font-size:9px;letter-spacing:1.6px;color:#82966f;font-weight:850}.title-row h1{font-size:28px;letter-spacing:-1px;margin:8px 0}.title-row p{font-size:11px;line-height:1.7;color:#89968e;max-width:700px}.title-actions{display:flex;align-items:center;gap:8px}.edit-link{font-size:9px;font-weight:850;color:#4f7447;text-decoration:none;border:1px solid #dfe8da;border-radius:20px;padding:6px 10px}.delete-link{font-size:9px;font-weight:850;color:#a64b3c;background:white;border:1px solid #f1d9d4;border-radius:20px;padding:6px 10px;cursor:pointer}.delete-link.danger{background:#a64b3c;color:white;border-color:#a64b3c}.status,.complete-pill{background:#fff4df;color:#a8802d;border-radius:20px;padding:7px 10px;font-size:8px;white-space:nowrap}.status.done,.complete-pill{background:#edf6e6;color:#61833f}.scenario-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:15px}.panel,.run-card{background:#fff;border:1px solid #e8eee7;border-radius:13px;padding:20px}.scenario>p{color:#7f8e83;font-size:11px;line-height:1.7}.subhead{font-size:10px;font-weight:850;margin:20px 0 10px}.chips{display:flex;gap:7px;flex-wrap:wrap}.chips span{padding:7px 9px;border-radius:6px;background:#f2f6ef;color:#58734d;font-size:9px}.run-card{background:linear-gradient(145deg,#1e4839,#112d25);color:#fff}.run-icon{width:34px;height:34px;border-radius:10px;background:#c5f277;color:#21402f;display:grid;place-items:center;margin-bottom:13px;font-size:19px}.run-card .eyebrow{color:#bddb98}.run-card h3{font-size:19px;line-height:1.3;letter-spacing:-.5px;margin:8px 0}.run-card p{font-size:10px;line-height:1.7;color:#b0c3b7}.gaps{background:rgba(255,255,255,.08);border-radius:8px;padding:10px;margin:10px 0;font-size:9px;line-height:1.6;color:#d6e4da}.gaps>b{display:block;color:#c5f277;margin-bottom:4px}.gaps a{display:inline-block;margin-top:6px;color:#c5f277;font-weight:800;text-decoration:none}.run-card button{border:0;border-radius:8px;background:#c5f277;color:#1c3b2d;font-size:10px;font-weight:900;padding:12px 15px;cursor:pointer;width:100%;margin-top:9px}.run-card button:disabled{opacity:.6;cursor:wait}.run-card button span{margin-left:10px}.progress-note{display:block;color:#c7d9cd;font-size:9px;margin-top:10px;text-align:center}.history{margin-top:16px}.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px}.section-head h2,.results-head h2{font-size:17px;letter-spacing:-.5px;margin:5px 0}.muted{font-size:9px;color:#9ba69e}.history-row{display:flex;align-items:center;gap:11px;padding:12px 0;width:100%;border:0;border-top:1px solid #f0f3ef;background:white;text-align:left;cursor:pointer}.history-mark{width:32px;height:32px;border-radius:9px;background:#eef5e8;color:#74944e;display:grid;place-items:center}.history-info{flex:1}.history-info b,.history-info small{display:block}.history-info b{font-size:10px}.history-info small{font-size:9px;color:#99a49c;margin-top:4px}.history-row>span{font-size:9px;color:#5c7d50;font-weight:800}.results{margin-top:28px}.results-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px}.results-head p{font-size:10px;color:#8c9890}.report-label,.mini-label{font-size:8px;letter-spacing:1px;color:#82966f;font-weight:900}.report-text{white-space:pre-wrap;font-size:11px;line-height:1.8;color:#59685f;margin-top:13px}.recommendations{margin-top:17px;padding-top:14px;border-top:1px solid #edf1ec}.recommendations>b{font-size:10px}.recommendations>div{display:flex;gap:8px;font-size:10px;color:#6e7d72;margin-top:9px}.recommendations>div span{color:#78a04f}.agent-heading{margin:22px 0 12px}.agents-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.agent-card{padding:17px}.agent-top{display:flex;align-items:center;gap:9px}.agent-top>b{font-size:11px;flex:1}.source-pill{font-size:8px;font-weight:900;padding:3px 7px;border-radius:20px}.source-pill.ai{background:#e8f1ff;color:#3060b8}.source-pill.rules{background:#f3f1ea;color:#8a7a4a}.agent-bullet{width:28px;height:28px;border-radius:8px;background:#edf4e8;color:#6e914a;display:grid;place-items:center}.agent-card>p{font-size:10px;line-height:1.7;color:#718076;white-space:pre-wrap}.agent-scores{display:grid;gap:6px;margin:12px 0}.agent-scores>div{padding:7px 8px;background:#f7f9f6;border-radius:6px;font-size:9px;color:#758378}.score-line{display:flex;justify-content:space-between;gap:8px}.justification{margin:5px 0 0;font-size:9px;line-height:1.6;color:#7c897f}.agent-scores b{color:#355c41}.mini-label{display:block;margin-top:12px}.mini-line{font-size:9px;color:#77847a;margin-top:6px;line-height:1.5}.comparison{margin-top:15px}.comparison-row{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-top:1px solid #eff3ee}.rank{width:24px;height:24px;border-radius:8px;background:#eff5e9;color:#628849;display:grid;place-items:center;font-weight:900;font-size:10px}.comparison-info{flex:1}.comparison-info>div:first-child{display:flex;justify-content:space-between;align-items:center;font-size:10px}.comparison-info strong{font-size:13px;color:#355b3f}.comparison-info strong small{font-size:8px;color:#94a096}.bar{height:6px;background:#edf2eb;border-radius:10px;margin:9px 0 7px;overflow:hidden}.bar i{display:block;height:100%;border-radius:10px;background:linear-gradient(90deg,#8eae67,#c5e88a)}.criteria{display:flex;gap:7px;flex-wrap:wrap}.criteria span{font-size:8px;color:#8a978d;background:#f6f8f5;padding:4px 6px;border-radius:4px}.weights{display:flex;gap:12px;flex-wrap:wrap;background:#f5f8f2;border-radius:8px;padding:12px;margin-top:9px}.weights>b{width:100%;font-size:9px;color:#53674f}.weights>span{font-size:8px;color:#7f8e80}.weights strong{color:#476843;margin-left:4px}.disagreements{background:#fff8e8;border:1px solid #f3e2b5;border-radius:8px;padding:12px;margin-top:12px;font-size:9px;line-height:1.6;color:#7d6a3a}.disagreements>b{display:block;font-size:10px;margin-bottom:6px;color:#8a6a1f}.disagreements>div+div{margin-top:5px}.alert{background:#fff0ed;color:#a34233;padding:11px;border-radius:8px;font-size:10px;margin:12px 0}@media(max-width:850px){.scenario-grid{grid-template-columns:1fr}.agents-grid{grid-template-columns:1fr}}@media(max-width:550px){.title-row{flex-direction:column}.results-head{align-items:flex-start;flex-direction:column;gap:9px}.panel,.run-card{padding:15px}}
  `]
})
export class DecisionDetailPage {
  private readonly api=inject(ApiService);
  private readonly route=inject(ActivatedRoute);
  private readonly router=inject(Router);
  readonly confirmingDelete=signal(false);
  readonly deleting=signal(false);
  readonly decision=signal<Decision|null>(null);
  readonly analyses=signal<Analysis[]>([]);
  readonly complete=signal<CompleteAnalysis|null>(null);
  readonly loading=signal(true);
  readonly analyzing=signal(false);
  readonly error=signal('');
  private id=0;
  constructor(){
    this.id=Number(this.route.snapshot.paramMap.get('id'));
    if(!Number.isInteger(this.id)||this.id<=0){this.error.set('El identificador de la decisión no es válido.');this.loading.set(false);return;}
    this.api.get<Decision>(`/decisions/${this.id}`).subscribe({next:value=>{this.decision.set(value);this.loading.set(false);},error:e=>{this.error.set(e.message);this.loading.set(false);}});
    this.reloadAnalyses(true);
  }
  deleteDecision(){
    this.deleting.set(true);this.error.set('');
    this.api.deleteDecision(this.id).subscribe({
      next:()=>void this.router.navigate(['/app/decisions']),
      error:e=>{this.error.set(e.message);this.deleting.set(false);this.confirmingDelete.set(false);}
    });
  }
  reloadAnalyses(openLatest=false){this.api.listAnalyses(this.id).subscribe({next:values=>{this.analyses.set(values);const latest=this.latestAnalysis(values);if(openLatest&&latest&&!this.complete())this.loadComplete(latest);},error:e=>this.error.set(e.message)});}
  private latestAnalysis(values:Analysis[]){return [...values].sort((a,b)=>(b.created_at||'').localeCompare(a.created_at||'')||b.id-a.id)[0];}
  runAnalysis(){
    this.analyzing.set(true);this.error.set('');this.complete.set(null);
    this.api.analyzeDecision(this.id).subscribe({
      next:analysis=>{this.analyzing.set(false);this.reloadAnalyses();this.loadComplete(analysis);},
      error:e=>{this.error.set(e.message);this.analyzing.set(false);}
    });
  }
  loadComplete(analysis:Analysis){
    this.api.completeAnalysis(this.id,analysis.id).subscribe({next:value=>this.complete.set(value),error:e=>this.error.set(e.message)});
  }
  sortedComparison(){return [...(this.complete()?.alternative_comparison||[])].sort((a,b)=>b.weighted_score-a.weighted_score);}
  gaps(){const value=this.decision();return value?findInformationGaps(value):[];}
  disagreements(){return findDisagreements(this.complete()?.alternative_comparison||[]);}
  entries(value:Record<string,number>){return Object.entries(value||{});}
  agentShort(name:string){return agentLabel(name);}
  source(agent:AgentResult){return evaluationSource(agent);}
  observations(agent:AgentResult){return visibleObservations(agent);}
  status(value:string){return value==='completed'?'Completada':value==='in_progress'?'En análisis':value==='cancelled'?'Cancelada':'Pendiente';}
}
