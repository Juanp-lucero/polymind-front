import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, User } from './api.service';
import { STORAGE_KEYS } from './storage-keys';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = signal(!!localStorage.getItem(STORAGE_KEYS.accessToken));

  login(email: string, password: string) {
    return new Promise<void>((resolve, reject) => {
      this.api.login({ email, password }).subscribe({
        next: tokens => {
          localStorage.setItem(STORAGE_KEYS.accessToken, tokens.access_token);
          localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refresh_token);
          this.isAuthenticated.set(true);
          this.loadUser().then(() => { localStorage.setItem(STORAGE_KEYS.userName, this.currentUser()?.name || ''); resolve(); }).catch(reject);
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
          localStorage.setItem(STORAGE_KEYS.userName, user.name);
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
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    this.currentUser.set(null);
    localStorage.removeItem(STORAGE_KEYS.userName);
    this.isAuthenticated.set(false);
    if (redirect) void this.router.navigate(['/login']);
  }
}
