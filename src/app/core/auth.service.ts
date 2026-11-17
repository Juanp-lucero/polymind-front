import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, User } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = signal(!!localStorage.getItem('polymind_access_token'));

  login(email: string, password: string) {
    return new Promise<void>((resolve, reject) => {
      this.api.login({ email, password }).subscribe({
        next: tokens => {
          localStorage.setItem('polymind_access_token', tokens.access_token);
          localStorage.setItem('polymind_refresh_token', tokens.refresh_token);
          this.isAuthenticated.set(true);
          this.loadUser().then(() => { localStorage.setItem('polymind_user_name', this.currentUser()?.name || ''); resolve(); }).catch(reject);
        },
        error: reject,
      });
    });
  }

  register(name: string, email: string, password: string) {
    return new Promise<void>((resolve, reject) => {
      this.api.register({ name, email, password }).subscribe({
        next: () => this.login(email, password).then(resolve).catch(reject),
        error: reject,
      });
    });
  }

  loadUser() {
    return new Promise<void>((resolve, reject) => {
      this.api.me().subscribe({
        next: user => {
          this.currentUser.set(user);
          localStorage.setItem('polymind_user_name', user.name);
          this.isAuthenticated.set(true);
          resolve();
        },
        error: error => {
          this.logout(false);
          reject(error);
        },
      });
    });
  }

  logout(redirect = true) {
    localStorage.removeItem('polymind_access_token');
    localStorage.removeItem('polymind_refresh_token');
    this.currentUser.set(null);
    localStorage.removeItem('polymind_user_name');
    this.isAuthenticated.set(false);
    if (redirect) void this.router.navigate(['/login']);
  }
}
