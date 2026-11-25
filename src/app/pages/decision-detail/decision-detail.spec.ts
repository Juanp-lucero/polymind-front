import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiService, CompleteAnalysis, Decision } from '../../core/api.service';
import { DecisionDetailPage } from './decision-detail';

const DECISION: Decision = {
  id: 3,
  user_id: 1,
  title: 'Tienda',
  description: 'Corta',
  context: '',
  alternatives: ['A', 'B'],
  status: 'pending'
};

const REPORT: CompleteAnalysis = {
  id: 10,
  decision_id: 3,
  analysis: 'Informe',
  recommendations: [],
  status: 'completed',
  created_at: '2026-11-24T10:00:00Z',
  agent_results: [],
  alternative_comparison: [
    { alternative: 'A', weighted_score: 6, criteria: { 'Financial Agent': 9, 'Risk Agent': 2 } },
    { alternative: 'B', weighted_score: 5, criteria: { 'Financial Agent': 5, 'Risk Agent': 5 } }
  ],
  weights: { 'Financial Agent': 0.5, 'Risk Agent': 0.5 }
};

describe('DecisionDetailPage', () => {
  let fixture: ComponentFixture<DecisionDetailPage>;
  let page: DecisionDetailPage;
  let api: Record<string, ReturnType<typeof vi.fn>>;

  async function setup(analyses = [REPORT]) {
    api = {
      get: vi.fn(() => of(DECISION)),
      listAnalyses: vi.fn(() => of(analyses)),
      completeAnalysis: vi.fn(() => of(REPORT)),
      analyzeDecision: vi.fn(() => of(REPORT)),
      deleteDecision: vi.fn(() => of({ message: 'ok' }))
    };
    await TestBed.configureTestingModule({
      imports: [DecisionDetailPage],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '3' }) } } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(DecisionDetailPage);
    page = fixture.componentInstance;
  }

  it('opens the latest analysis automatically', async () => {
    await setup();
    expect(api['completeAnalysis']).toHaveBeenCalledWith(3, 10);
    expect(page.complete()?.id).toBe(10);
  });

  it('does not request details when there are no analyses', async () => {
    await setup([]);
    expect(api['completeAnalysis']).not.toHaveBeenCalled();
  });

  it('lists the information the decision is missing', async () => {
    await setup();
    expect(page.gaps().length).toBe(2);
  });

  it('detects disagreements in the loaded report', async () => {
    await setup();
    expect(page.disagreements().map(item => item.alternative)).toEqual(['A']);
  });

  it('shows the API error when the analysis fails', async () => {
    await setup();
    api['analyzeDecision'].mockReturnValueOnce(throwError(() => new Error('Servicio no disponible')));
    page.runAnalysis();
    expect(page.analyzing()).toBe(false);
    expect(page.error()).toBe('Servicio no disponible');
  });
});
