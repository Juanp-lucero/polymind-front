import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Decision } from '../../core/api.service';

@Component({
  selector:'app-decisions-page',
  imports:[DatePipe,RouterLink],
  template:`
    <div class="page-head"><div><span class="eyebrow">PORTAFOLIO ESTRATÉGICO</span><h1>Tus decisiones</h1><p>Organiza tus escenarios y analiza cada alternativa con una perspectiva multiagente.</p></div><a routerLink="/app/decisions/new" class="create">＋ Crear decisión</a></div>
    <div class="toolbar"><div class="search">⌕ <input placeholder="Buscar por nombre o descripción..." [value]="query()" (input)="query.set($any($event.target).value)"></div><select [value]="filter()" (change)="filter.set($any($event.target).value)"><option value="all">Todos los estados</option><option value="pending">Pendientes</option><option value="in_progress">En análisis</option><option value="completed">Completadas</option><option value="cancelled">Canceladas</option></select><span class="count">{{filtered().length}} decisiones</span></div>
    @if(error()){<div class="alert">{{error()}}</div>}
    @if(loading()){<div class="loading">Cargando tu portafolio...</div>}
    @else if(filtered().length===0){<div class="empty"><div>◇</div><h3>No hay decisiones para mostrar</h3><p>{{query()?'Prueba con otra búsqueda.':'Crea tu primera decisión para comenzar el análisis.'}}</p><a routerLink="/app/decisions/new">Crear decisión ↗</a></div>}
    @else{<div class="cards">@for(item of filtered();track item.id){<article class="decision-card"><div class="card-top"><span class="id">DECISIÓN #{{item.id.toString().padStart(3,'0')}}</span><span class="status" [class.complete]="item.status==='completed'" [class.progress]="item.status==='in_progress'">{{status(item.status)}}</span></div><h3>{{item.title}}</h3><p class="description">{{item.description}}</p><div class="alternatives"><span>ALTERNATIVAS</span><b>{{item.alternatives.length}}</b><div class="chips">@for(alt of item.alternatives.slice(0,3);track alt){<i>{{alt}}</i>}@if(item.alternatives.length>3){<i>+{{item.alternatives.length-3}}</i>}</div></div><div class="card-footer"><span>{{item.created_at | date:'dd MMM, yyyy'}}</span><a [routerLink]="['/app/decisions',item.id]">Abrir decisión <b>↗</b></a></div></article>}</div>}
  `,
  styles:[`
    :host{display:block}.page-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:25px}.eyebrow{font-size:9px;letter-spacing:1.7px;color:#81976e;font-weight:850}.page-head h1{font-size:29px;letter-spacing:-1px;margin:8px 0}.page-head p{margin:0;color:#8a968f;font-size:11px;max-width:560px;line-height:1.6}.create{background:#1b4035;color:white;text-decoration:none;padding:12px 16px;border-radius:9px;font-size:10px;font-weight:800;white-space:nowrap}.toolbar{display:flex;align-items:center;gap:11px;margin-bottom:17px}.search{height:40px;background:white;border:1px solid #e7ede7;border-radius:9px;display:flex;align-items:center;gap:9px;padding:0 12px;flex:1;color:#82927f}.search input{border:0;outline:none;width:100%;font:inherit;font-size:10px}.toolbar select{height:40px;padding:0 12px;border:1px solid #e7ede7;border-radius:9px;background:white;color:#65736a;font-size:10px;outline:none}.count{font-size:9px;color:#9ba69e;white-space:nowrap}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.decision-card{background:#fff;border:1px solid #e8eee7;border-radius:13px;padding:18px 19px;transition:.2s}.decision-card:hover{border-color:#b9cda8;transform:translateY(-2px);box-shadow:0 10px 24px #1b40350b}.card-top{display:flex;justify-content:space-between;align-items:center}.id{font-size:8px;letter-spacing:1px;color:#9ba69e;font-weight:850}.status{font-size:8px;border-radius:20px;background:#fff5df;color:#a8802d;padding:6px 9px}.status.complete{background:#eef7e7;color:#628442}.status.progress{background:#edf3ff;color:#5876aa}.decision-card h3{font-size:16px;letter-spacing:-.3px;margin:16px 0 7px;color:#203329}.description{font-size:10px;line-height:1.6;color:#89958d;height:33px;overflow:hidden;margin:0}.alternatives{margin-top:18px;padding:12px;background:#f7f9f6;border-radius:9px;display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}.alternatives>span{font-size:8px;color:#89988a;letter-spacing:1px;font-weight:850}.alternatives>b{font-size:13px;color:#36563e}.chips{grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap}.chips i{font-style:normal;background:white;border:1px solid #e8eee6;border-radius:5px;padding:5px 7px;font-size:8px;color:#718075}.card-footer{border-top:1px solid #eff2ee;margin-top:14px;padding-top:12px;display:flex;justify-content:space-between;align-items:center}.card-footer>span{font-size:9px;color:#a0aaa3}.card-footer a{font-size:9px;color:#4f7447;text-decoration:none;font-weight:850}.card-footer b{margin-left:8px}.empty{background:white;border:1px dashed #d6e0d4;border-radius:13px;text-align:center;padding:55px 15px}.empty>div{margin:auto;width:46px;height:46px;border-radius:14px;background:#eef5e9;color:#6f954b;display:grid;place-items:center;font-size:24px}.empty h3{font-size:15px;margin:14px 0 6px}.empty p,.loading{font-size:10px;color:#98a39b}.empty a{display:inline-block;margin-top:10px;color:#547949;font-size:10px;font-weight:850;text-decoration:none}.loading{text-align:center;padding:50px}.alert{background:#fff0ed;color:#a34233;padding:12px;border-radius:8px;margin-bottom:14px;font-size:11px}@media(max-width:800px){.cards{grid-template-columns:1fr}}@media(max-width:560px){.page-head{align-items:flex-start;flex-direction:column}.toolbar{flex-wrap:wrap}.search{flex-basis:100%}.toolbar select{flex:1}}
  `]
})
export class DecisionsPage{
  private readonly api=inject(ApiService);
  readonly decisions=signal<Decision[]>([]);
  readonly query=signal('');
  readonly filter=signal('all');
  readonly loading=signal(true);
  readonly error=signal('');
  readonly filtered=()=>this.decisions().filter(item=>{
    const term=this.query().toLowerCase();
    const matches=(item.title+' '+item.description).toLowerCase().includes(term);
    return matches&&(this.filter()==='all'||item.status===this.filter());
  });
  constructor(){this.reload();}
  reload(){this.loading.set(true);this.api.listDecisions().subscribe({next:items=>{this.decisions.set(items);this.loading.set(false);},error:e=>{this.error.set(e.message);this.loading.set(false);}});}
  status(value:string){return value==='completed'?'Completada':value==='in_progress'?'En análisis':value==='cancelled'?'Cancelada':'Pendiente';}
}
