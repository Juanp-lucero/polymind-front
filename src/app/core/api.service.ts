import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Decision {
  id: number;
  user_id: number;
  title: string;
  description: string;
  context?: string | null;
  alternatives: string[];
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Analysis {
  id: number;
  decision_id: number;
  analysis: string;
  recommendations: string[];
  status: string;
  created_at?: string | null;
}

export interface AgentResult {
  agent: string;
  analysis: string;
  recommendations?: string[];
  observations?: string[];
  alternative_evaluations?: Array<{
    alternative: string;
    score: number;
    justification: string;
  }>;
}

export interface AlternativeComparison {
  alternative: string;
  weighted_score: number;
  criteria: Record<string, number>;
}

export interface CompleteAnalysis extends Analysis {
  agent_results: AgentResult[];
  alternative_comparison: AlternativeComparison[];
  weights: Record<string, number>;
}

export interface Statistics {
  total_decisions: number;
  total_analyses: number;
  analyses_by_status: Record<string, number>;
  average_score: number;
  top_recommendations: Array<{ alternative: string; times_recommended: number }>;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private headers(): HttpHeaders {
    const token = localStorage.getItem('polymind_access_token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      localStorage.removeItem('polymind_access_token');
      localStorage.removeItem('polymind_refresh_token');
      localStorage.removeItem('polymind_user_name');
      window.location.assign('/login');
    }
    const message =
      typeof error.error?.detail === 'string'
        ? error.error.detail
        : error.status === 0
          ? 'No se pudo conectar con el servidor. Verifica que el backend esté activo.'
          : 'Ocurrió un error al procesar la solicitud.';
    return throwError(() => new Error(message));
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { headers: this.headers() })
      .pipe(catchError(error => this.handleError(error)));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, { headers: this.headers() })
      .pipe(catchError(error => this.handleError(error)));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body, { headers: this.headers() })
      .pipe(catchError(error => this.handleError(error)));
  }

  postMultipart<T>(path: string, body: FormData): Observable<T> {
    const token = localStorage.getItem('polymind_access_token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<T>(`${this.baseUrl}${path}`, body, { headers })
      .pipe(catchError(error => this.handleError(error)));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, { headers: this.headers() })
      .pipe(catchError(error => this.handleError(error)));
  }

  register(data: { name: string; email: string; password: string }) {
    return this.post<User>('/auth/register', data);
  }

  login(data: { email: string; password: string }) {
    return this.post<TokenResponse>('/auth/login', data);
  }

  me() {
    return this.get<User>('/auth/me');
  }

  listDecisions() {
    return this.get<Decision[]>('/decisions/');
  }

  createDecision(data: {
    title: string;
    description: string;
    context: string;
    alternatives: string[];
  }) {
    return this.post<Decision>('/decisions/', data);
  }

  updateDecision(id: number, data: Partial<Decision>) {
    return this.put<Decision>(`/decisions/${id}`, data);
  }

  deleteDecision(id: number) {
    return this.delete<{ message: string }>(`/decisions/${id}`);
  }

  analyzeDecision(id: number) {
    return this.post<Analysis>(`/decisions/${id}/analyze`, {});
  }

  listAnalyses(id: number) {
    return this.get<Analysis[]>(`/decisions/${id}/analyses`);
  }

  completeAnalysis(decisionId: number, analysisId: number) {
    return this.get<CompleteAnalysis>(
      `/decisions/${decisionId}/analyses/${analysisId}/complete`
    );
  }

  statistics() {
    return this.get<Statistics>('/stats/');
  }
}
