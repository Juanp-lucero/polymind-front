import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter, Router, UrlTree } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  function runGuard(authenticated: boolean) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: signal(authenticated) } }
      ]
    });
    return TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never)
    );
  }

  it('lets authenticated users in', () => {
    expect(runGuard(true)).toBe(true);
  });

  it('redirects anonymous users to the login page', () => {
    const result = runGuard(false) as UrlTree;
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result)).toBe('/login');
  });
});
