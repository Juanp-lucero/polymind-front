import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
import { STORAGE_KEYS } from './storage-keys';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('sends the access token on authenticated requests', () => {
    localStorage.setItem(STORAGE_KEYS.accessToken, 'access-1');
    api.listDecisions().subscribe();

    const request = http.expectOne(`${base}/decisions/`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer access-1');
    request.flush([]);
  });

  it('renews the session on 401 and repeats the request', () => {
    localStorage.setItem(STORAGE_KEYS.accessToken, 'expired');
    localStorage.setItem(STORAGE_KEYS.refreshToken, 'refresh-1');

    let result: unknown;
    api.listDecisions().subscribe(value => (result = value));

    http
      .expectOne(`${base}/decisions/`)
      .flush({ detail: 'expired' }, { status: 401, statusText: 'Unauthorized' });

    const refresh = http.expectOne(`${base}/auth/refresh`);
    expect(refresh.request.body).toEqual({ refresh_token: 'refresh-1' });
    refresh.flush({ access_token: 'access-2', refresh_token: 'refresh-2', token_type: 'bearer' });

    const retry = http.expectOne(`${base}/decisions/`);
    expect(retry.request.headers.get('Authorization')).toBe('Bearer access-2');
    retry.flush([{ id: 1 }]);

    expect(result).toEqual([{ id: 1 }]);
    expect(localStorage.getItem(STORAGE_KEYS.refreshToken)).toBe('refresh-2');
  });

  it('does not try to refresh failed logins', () => {
    let message = '';
    api.login({ email: 'a@example.com', password: 'x' }).subscribe({
      error: (error: Error) => (message = error.message)
    });

    http
      .expectOne(`${base}/auth/login`)
      .flush({ detail: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });

    http.expectNone(`${base}/auth/refresh`);
    expect(message).toBe('Credenciales inválidas');
  });

  it('turns connection errors into a friendly message', () => {
    let message = '';
    api.statistics().subscribe({ error: (error: Error) => (message = error.message) });

    http.expectOne(`${base}/stats/`).error(new ProgressEvent('error'), { status: 0 });

    expect(message).toContain('No se pudo conectar con el servidor');
  });
});
