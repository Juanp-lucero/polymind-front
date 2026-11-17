import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector:'app-decision-form-page',
  imports:[FormsModule,RouterLink],
  template:`
    <a class="back" routerLink="/app/decisions">← Volver a decisiones</a>
    <div class="intro"><span class="eyebrow">NUEVO ESCENARIO</span><h1>Define tu decisión</h1><p>Cuéntanos qué necesitas resolver. Tus agentes evaluarán las alternativas desde distintas perspectivas.</p></div>
    <div class="form-layout">
      <form class="form-card" (ngSubmit)="submit()">
        @if(error()){<div class="alert">{{error()}}</div>}
        <div class="section-title"><span>01</span><div><b>Información general</b><small>Contexto para comprender el reto</small></div></div>
        <label>Título de la decisión <span>*</span><input name="title" [(ngModel)]="title" required minlength="3" maxlength="150" placeholder="Ej. Expandir operaciones a una nueva ciudad"></label>
        <label>Descripción del reto <span>*</span><textarea name="description" [(ngModel)]="description" required minlength="10" rows="4" placeholder="Describe qué necesitas decidir, qué está en juego y qué resultado buscas..."></textarea><small class="helper">Sé específico. Una descripción clara mejora la calidad del análisis.</small></label>
        <label>Contexto adicional<textarea name="context" [(ngModel)]="context" rows="3" placeholder="Presupuesto, plazos, restricciones, recursos disponibles..."></textarea></label>
        <div class="rule"></div>
        <div class="section-title"><span>02</span><div><b>Alternativas a evaluar</b><small>Incluye al menos dos caminos posibles</small></div></div>
        @for(alt of alternatives();track $index;let i=$index){<div class="alternative-input"><div class="alt-index">{{(i+1).toString().padStart(2,'0')}}</div><input [name]="'alternative-'+i" [ngModel]="alt" (ngModelChange)="updateAlternative(i,$event)" required placeholder="Describe una alternativa"><button type="button" (click)="removeAlternative(i)" [disabled]="alternatives().length<=2" aria-label="Eliminar alternativa">×</button></div>}
        <button class="add-alt" type="button" (click)="addAlternative()" [disabled]="alternatives().length>=8">＋ Añadir alternativa</button>
        <div class="form-actions"><a routerLink="/app/decisions">Cancelar</a><button class="submit" type="submit" [disabled]="loading()">{{loading()?'Guardando...':'Guardar decisión'}} <span>↗</span></button></div>
      </form>
      <aside class="guide-card"><div class="guide-icon">✳</div><span class="eyebrow">CÓMO FUNCIONA</span><h3>Una decisión.<br>Cuatro perspectivas.</h3><p>Cuando guardes tu escenario podrás ejecutar un análisis con cuatro agentes especializados.</p>
        <div class="agent"><b>01</b><div><strong>Financiero</strong><small>Viabilidad y costos</small></div></div>
        <div class="agent"><b>02</b><div><strong>Tecnológico</strong><small>Factibilidad e infraestructura</small></div></div>
        <div class="agent"><b>03</b><div><strong>Impacto humano</strong><small>Personas y adopción</small></div></div>
        <div class="agent"><b>04</b><div><strong>Riesgos</strong><small>Exposición y mitigación</small></div></div>
        <div class="guide-foot">PONDERACIÓN 30% · 30% · 20% · 20%</div>
      </aside>
    </div>
  `,
  styles:[`
    :host{display:block}.back{font-size:10px;color:#6c8569;text-decoration:none;font-weight:800}.intro{margin:22px 0 25px}.eyebrow{font-size:9px;letter-spacing:1.7px;color:#83976e;font-weight:850}.intro h1{font-size:29px;letter-spacing:-1px;margin:8px 0}.intro p{font-size:11px;color:#8c9890;max-width:630px;line-height:1.7}.form-layout{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(240px,.8fr);align-items:start;gap:16px}.form-card,.guide-card{background:white;border:1px solid #e8eee7;border-radius:13px;padding:22px}.form-card{display:grid;gap:17px}.section-title{display:flex;align-items:center;gap:12px;margin-bottom:2px}.section-title>span{width:31px;height:31px;border-radius:9px;background:#eef5e8;color:#64864c;display:grid;place-items:center;font-size:10px;font-weight:850}.section-title b,.section-title small{display:block}.section-title b{font-size:12px;color:#26382d}.section-title small{font-size:9px;color:#9aa59d;margin-top:4px}.form-card label{font-size:10px;font-weight:800;color:#526057;display:grid;gap:8px}.form-card label>span{display:inline;color:#b56550}.form-card input,.form-card textarea{border:1px solid #e1e8e1;border-radius:8px;padding:12px;font:inherit;font-size:11px;outline:none;resize:vertical}.form-card input:focus,.form-card textarea:focus{border-color:#98b57d;box-shadow:0 0 0 3px #c5f2772b}.form-card input::placeholder,.form-card textarea::placeholder{color:#aab3ac}.helper{font-size:9px;color:#98a49b;font-weight:400}.rule{height:1px;background:#edf1ec;margin:2px 0}.alternative-input{display:flex;align-items:center;gap:9px}.alt-index{width:28px;height:28px;flex:0 0 28px;border-radius:8px;background:#f3f6f1;color:#78926a;display:grid;place-items:center;font-size:9px;font-weight:850}.alternative-input input{flex:1;min-width:0}.alternative-input button{border:0;background:#fff0ed;color:#a64b3c;border-radius:7px;width:29px;height:29px;font-size:18px;cursor:pointer}.alternative-input button:disabled{opacity:.3}.add-alt{justify-self:start;border:1px dashed #b8c9ad;background:#f7faf4;color:#5d7e4f;padding:9px 12px;border-radius:8px;font-size:9px;font-weight:850;cursor:pointer}.add-alt:disabled{opacity:.4}.form-actions{display:flex;justify-content:flex-end;align-items:center;gap:19px;border-top:1px solid #edf1ec;padding-top:17px;margin-top:2px}.form-actions>a{font-size:10px;color:#86938a;text-decoration:none}.submit{border:0;border-radius:8px;background:#1c4235;color:#fff;padding:12px 16px;font-size:10px;font-weight:850;cursor:pointer}.submit:disabled{opacity:.6}.submit span{margin-left:14px}.guide-card{background:linear-gradient(155deg,#173d32,#102b25);color:#fff;padding:22px}.guide-icon{width:37px;height:37px;border-radius:11px;background:#c5f277;color:#1b3a2c;display:grid;place-items:center;font-size:20px;margin-bottom:18px}.guide-card .eyebrow{color:#b8da8d}.guide-card h3{font-size:22px;letter-spacing:-.8px;line-height:1.2;margin:9px 0}.guide-card>p{font-size:10px;color:#b0c2b7;line-height:1.7;margin-bottom:19px}.agent{display:flex;align-items:center;gap:11px;padding:12px 0;border-top:1px solid #ffffff18}.agent>b{font-size:9px;color:#b7db88}.agent strong,.agent small{display:block}.agent strong{font-size:10px}.agent small{font-size:9px;color:#91aa9e;margin-top:3px}.guide-foot{border-top:1px solid #ffffff20;margin-top:9px;padding-top:14px;color:#bedb9c;font-size:8px;letter-spacing:1px}.alert{background:#fff0ed;color:#a34233;border-radius:8px;padding:11px;font-size:10px}@media(max-width:850px){.form-layout{grid-template-columns:1fr}.guide-card{order:-1}}@media(max-width:500px){.form-card{padding:16px}.guide-card{padding:18px}.form-actions{justify-content:space-between}}
  `]
})
export class DecisionFormPage{
  private readonly api=inject(ApiService);
  private readonly router=inject(Router);
  title='';description='';context='';
  readonly alternatives=signal(['','']);
  readonly loading=signal(false);
  readonly error=signal('');
  updateAlternative(index:number,value:string){this.alternatives.update(list=>list.map((item,i)=>i===index?value:item));}
  addAlternative(){if(this.alternatives().length<8)this.alternatives.update(list=>[...list,'']);}
  removeAlternative(index:number){if(this.alternatives().length>2)this.alternatives.update(list=>list.filter((_,i)=>i!==index));}
  submit(){
    const alternatives=this.alternatives().map(item=>item.trim()).filter(Boolean);
    if(alternatives.length<2){this.error.set('Agrega al menos dos alternativas completas.');return;}
    if(new Set(alternatives.map(item=>item.toLowerCase())).size!==alternatives.length){this.error.set('No repitas alternativas.');return;}
    this.loading.set(true);this.error.set('');
    this.api.createDecision({title:this.title.trim(),description:this.description.trim(),context:this.context.trim(),alternatives}).subscribe({
      next:decision=>void this.router.navigate(['/app/decisions',decision.id]),
      error:error=>{this.error.set(error.message);this.loading.set(false);}
    });
  }
}
