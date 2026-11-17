import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, RouterLink],
  template: `
    <main class="register-shell">
      <aside><div class="brand"><b>P</b> polymind.ai</div><div class="hero"><small>YOUR NEXT MOVE STARTS HERE</small><h1>Piensa mejor.<br><i>Decide con datos.</i></h1><p>Un espacio para convertir incertidumbre en decisiones fundamentadas.</p></div><span class="aside-foot">POLYMIND INTELLIGENCE PLATFORM</span></aside>
      <section><div class="form-box"><span class="kicker">EMPIEZA HOY</span><h2>Crea tu cuenta</h2><p>Configura tu espacio personal de decisiones.</p>
      @if(error()){<div class="alert">{{error()}}</div>}
      <form (ngSubmit)="submit()">
        <label>Nombre completo<input name="name" [(ngModel)]="name" required minlength="2" placeholder="Tu nombre"></label>
        <label>Correo electrónico<input type="email" name="email" [(ngModel)]="email" required placeholder="nombre@empresa.com"></label>
        <label>Contraseña<input type="password" name="password" [(ngModel)]="password" required minlength="8" placeholder="Mínimo 8 caracteres"></label>
        <button [disabled]="loading()">{{loading()?'Creando cuenta...':'Crear cuenta'}} <span>↗</span></button>
      </form><div class="switch">¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a></div></div></section>
    </main>
  `,
  styles:[`
    :host{display:block;min-height:100vh;color:#1b2823}.register-shell{min-height:100vh;display:grid;grid-template-columns:42% 58%;background:#fff}aside{background:linear-gradient(145deg,#102d27,#071b17);color:#fff;padding:42px 9%;display:flex;flex-direction:column;justify-content:space-between}.brand{display:flex;align-items:center;gap:12px;font-weight:800;font-size:20px}.brand b{background:#c5f277;color:#18352b;border-radius:10px;width:34px;height:34px;display:grid;place-items:center}.hero small,.kicker{font-size:10px;letter-spacing:2px;color:#a8d56b;font-weight:800}.hero h1{font-size:clamp(38px,4.3vw,62px);letter-spacing:-2px;line-height:1.04}.hero h1 i{font-family:Georgia,serif;font-weight:400;color:#c5f277}.hero p{color:#afc1b9;line-height:1.8;max-width:360px}.aside-foot{font-size:9px;letter-spacing:1.5px;color:#7e9a90}section{display:grid;place-items:center;padding:35px}.form-box{width:min(390px,100%)}.kicker{color:#76984d}.form-box h2{font-size:35px;letter-spacing:-1.5px;margin:15px 0 7px}.form-box>p{font-size:13px;color:#8a9590;margin-bottom:30px}.form-box form{display:grid;gap:17px}.form-box label{font-size:12px;font-weight:700;display:grid;gap:8px}.form-box input{height:48px;border:1px solid #dce4de;border-radius:9px;padding:0 13px;outline:none;font:inherit}.form-box input:focus{border-color:#8cad60;box-shadow:0 0 0 3px #c5f27735}.form-box button{height:49px;border:0;border-radius:9px;background:#193c33;color:#fff;font-weight:750;cursor:pointer;margin-top:5px}.form-box button:disabled{opacity:.6}.form-box button span{margin-left:16px}.switch{text-align:center;color:#87918d;font-size:12px;margin-top:24px}.switch a{color:#355c43;font-weight:800;text-decoration:none}.alert{padding:12px;border-radius:9px;background:#fff0ed;color:#a53b2d;font-size:12px;margin-bottom:14px}@media(max-width:740px){.register-shell{grid-template-columns:1fr}aside{display:none}section{min-height:100vh;padding:28px}}
  `]
})
export class RegisterPage {
  private readonly auth=inject(AuthService);
  private readonly router=inject(Router);
  name=''; email=''; password='';
  readonly loading=signal(false); readonly error=signal('');
  async submit(){
    if(this.password.length<8){this.error.set('La contraseña debe tener al menos 8 caracteres.');return;}
    this.loading.set(true);this.error.set('');
    try{await this.auth.register(this.name,this.email,this.password);await this.router.navigate(['/app']);}
    catch(error){this.error.set(error instanceof Error?error.message:'No fue posible crear la cuenta.');}
    finally{this.loading.set(false);}
  }
}