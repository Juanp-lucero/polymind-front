import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { STORAGE_KEYS } from './storage-keys';

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('stores the tokens and loads the user after login', async () => {
    const done = auth.login('ana@example.com', 'Secret123!');

    http
      .expectOne(`${base}/auth/login`)
      .flush({ access_token: 'a1', refresh_token: 'r1', token_type: 'bearer' });
    http
      .expectOne(`${base}/auth/me`)
      .flush({ id: 1, name: 'Ana López', email: 'ana@example.com', is_active: true });

    await done;
    expect(localStorage.getItem(STORAGE_KEYS.accessToken)).toBe('a1');
    expect(localStorage.getItem(STORAGE_KEYS.refreshToken)).toBe('r1');
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.currentUser()?.name).toBe('Ana López');
  });

  it('clears the session and goes to login on logout', () => {
    localStorage.setItem(STORAGE_KEYS.accessToken, 'a1');
    localStorage.setItem(STORAGE_KEYS.refreshToken, 'r1');
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    auth.logout();

    expect(localStorage.getItem(STORAGE_KEYS.accessToken)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.refreshToken)).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
