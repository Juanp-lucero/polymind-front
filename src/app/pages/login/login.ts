import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-visual">
        <div class="brand"><span class="brand-mark">P</span><span>polymind<span class="brand-light">.ai</span></span></div>
        <div class="visual-copy">
          <span class="eyebrow"><i></i> INTELLIGENCE, IN MOTION</span>
          <h1>Decisiones complejas.<br><em>Claridad extraordinaria.</em></h1>
          <p>Reúne perspectivas especializadas, compara escenarios y avanza con confianza.</p>
        </div>
        <div class="orbit-card"><div class="orbit-icon">✳</div><div><strong>Inteligencia colectiva</strong><small>5 agentes trabajando en conjunto</small></div><span class="online-dot"></span></div>
        <div class="visual-foot">STRATEGY · ANALYSIS · ACTION <span>© 2026 POLYMIND AI</span></div>
      </section>
      <section class="auth-form-wrap">
        <div class="mobile-brand"><span class="brand-mark">P</span> polymind.ai</div>
        <div class="auth-form">
          <span class="form-kicker">BIENVENIDO DE NUEVO</span>
          <h2>Inicia sesión</h2>
          <p class="muted">Accede a tu espacio de análisis y decisiones.</p>
          @if (error()) { <div class="alert">{{ error() }}</div> }
          <form (ngSubmit)="submit()">
            <label>Correo electrónico<input type="email" name="email" [(ngModel)]="email" placeholder="nombre@empresa.com" required autocomplete="email"></label>
            <label>Contraseña<input type="password" name="password" [(ngModel)]="password" placeholder="Tu contraseña" required autocomplete="current-password"></label>
            <button class="primary-btn" type="submit" [disabled]="loading()">{{ loading() ? 'Ingresando...' : 'Entrar al workspace' }} <span>↗</span></button>
          </form>
          <div class="auth-switch">¿Aún no tienes cuenta? <a routerLink="/register">Crear cuenta</a></div>
          <div class="secure-note">⌁ Conexión segura · Sesión protegida</div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh;color:#17221f}.auth-shell{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;background:#fff}.auth-visual{position:relative;overflow:hidden;padding:42px 8%;background:radial-gradient(circle at 82% 18%,#214b42 0,transparent 30%),linear-gradient(145deg,#102b26,#071a17 75%);color:#f5f8f3;display:flex;flex-direction:column;justify-content:space-between}.auth-visual:after{content:"";position:absolute;width:500px;height:500px;border:1px solid #ffffff13;border-radius:50%;right:-180px;bottom:-210px;box-shadow:0 0 0 55px #ffffff08,0 0 0 110px #ffffff05}.brand{display:flex;align-items:center;gap:12px;font-size:21px;font-weight:750;letter-spacing:-1px}.brand-mark{width:34px;height:34px;border-radius:11px;background:#c5f277;color:#183028;display:grid;place-items:center;font-weight:900}.brand-light{color:#c5f277}.visual-copy{position:relative;z-index:1;max-width:570px;margin-top:25px}.eyebrow,.form-kicker{font-size:10px;letter-spacing:2px;font-weight:800;color:#c5f277}.eyebrow i,.online-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#c5f277;margin-right:8px}.visual-copy h1{font-size:clamp(38px,4.3vw,64px);line-height:1.04;letter-spacing:-2.7px;margin:24px 0}.visual-copy h1 em{font-family:Georgia,serif;font-weight:400;color:#c5f277}.visual-copy p{font-size:15px;line-height:1.8;color:#afc1b9;max-width:420px}.orbit-card{position:relative;z-index:1;display:flex;align-items:center;gap:14px;padding:16px 18px;border:1px solid #ffffff20;background:#ffffff0b;backdrop-filter:blur(8px);border-radius:15px;width:max-content;max-width:100%}.orbit-icon{height:42px;width:42px;border-radius:12px;background:#c5f27718;color:#c5f277;display:grid;place-items:center;font-size:24px}.orbit-card strong,.orbit-card small{display:block}.orbit-card strong{font-size:13px}.orbit-card small{font-size:11px;color:#a8bcb3;margin-top:5px}.online-dot{margin:0 0 0 18px}.visual-foot{font-size:9px;letter-spacing:1.5px;color:#7c9990;display:flex;justify-content:space-between;gap:12px}.auth-form-wrap{display:grid;place-items:center;padding:45px}.auth-form{width:min(390px,100%)}.form-kicker{color:#72934b}.auth-form h2{font-size:36px;letter-spacing:-1.5px;margin:14px 0 8px}.muted{color:#87918d;font-size:14px;margin:0 0 34px}.auth-form form{display:grid;gap:20px}.auth-form label{font-size:12px;font-weight:700;color:#43514b;display:grid;gap:9px}.auth-form input{width:100%;height:49px;border:1px solid #dfe5e0;border-radius:10px;padding:0 14px;font:inherit;font-size:13px;outline:none;transition:.2s}.auth-form input:focus{border-color:#8cad60;box-shadow:0 0 0 3px #c5f27735}.primary-btn{height:50px;border:0;border-radius:10px;background:#193c33;color:white;font-weight:700;font-size:13px;cursor:pointer;margin-top:5px;display:flex;justify-content:center;align-items:center;gap:20px}.primary-btn:hover{background:#285647}.primary-btn:disabled{opacity:.6;cursor:wait}.auth-switch{text-align:center;color:#87918d;font-size:12px;margin-top:25px}.auth-switch a{color:#355c43;font-weight:800;text-decoration:none;margin-left:4px}.secure-note{text-align:center;color:#a3aca7;font-size:10px;margin-top:60px;letter-spacing:.5px}.alert{padding:12px;border-radius:9px;background:#fff0ed;color:#a53b2d;font-size:12px;margin-bottom:18px}.mobile-brand{display:none}@media(max-width:760px){.auth-shell{grid-template-columns:1fr}.auth-visual{display:none}.auth-form-wrap{padding:30px 24px;align-content:center}.mobile-brand{display:flex;align-items:center;gap:10px;font-weight:800;margin-bottom:60px;justify-self:center}.secure-note{margin-top:45px}}
  `]
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal('');

  async submit() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.login(this.email, this.password);
      await this.router.navigate(['/app']);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No fue posible iniciar sesión.');
    } finally {
      this.loading.set(false);
    }
  }
}