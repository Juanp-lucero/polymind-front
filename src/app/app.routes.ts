import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterPage),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/dashboard-layout').then(m => m.DashboardLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', loadComponent: () => import('./pages/overview/overview').then(m => m.OverviewPage) },
      { path: 'decisions', loadComponent: () => import('./pages/decisions/decisions').then(m => m.DecisionsPage) },
      { path: 'decisions/new', loadComponent: () => import('./pages/decision-form/decision-form').then(m => m.DecisionFormPage) },
      { path: 'decisions/:id/edit', loadComponent: () => import('./pages/decision-form/decision-form').then(m => m.DecisionFormPage) },
      { path: 'decisions/:id', loadComponent: () => import('./pages/decision-detail/decision-detail').then(m => m.DecisionDetailPage) },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'app' },
  { path: '**', redirectTo: 'app' },
];
