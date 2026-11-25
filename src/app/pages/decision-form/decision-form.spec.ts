import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { ApiService, Decision } from '../../core/api.service';
import { DecisionFormPage } from './decision-form';

const DECISION: Decision = {
  id: 5,
  user_id: 1,
  title: 'Tienda en línea',
  description: 'Elegir la plataforma de comercio electrónico.',
  context: 'Presupuesto limitado',
  alternatives: ['WooCommerce', 'Shopify'],
  status: 'pending'
};

describe('DecisionFormPage', () => {
  let fixture: ComponentFixture<DecisionFormPage>;
  let page: DecisionFormPage;
  let api: {
    get: ReturnType<typeof vi.fn>;
    createDecision: ReturnType<typeof vi.fn>;
    updateDecision: ReturnType<typeof vi.fn>;
  };

  async function setup(id?: string) {
    api = {
      get: vi.fn(() => of(DECISION)),
      createDecision: vi.fn(() => of({ ...DECISION, id: 9 })),
      updateDecision: vi.fn(() => of(DECISION))
    };
    await TestBed.configureTestingModule({
      imports: [DecisionFormPage],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } }
        }
      ]
    }).compileComponents();
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(DecisionFormPage);
    page = fixture.componentInstance;
  }

  it('requires at least two complete alternatives', async () => {
    await setup();
    page.title = 'Nueva';
    page.description = 'Una descripción suficiente';
    page.alternatives.set(['Solo una', '  ']);
    page.submit();
    expect(page.error()).toContain('al menos dos alternativas');
    expect(api.createDecision).not.toHaveBeenCalled();
  });

  it('rejects repeated alternatives', async () => {
    await setup();
    page.alternatives.set(['Shopify', 'shopify']);
    page.submit();
    expect(page.error()).toBe('No repitas alternativas.');
  });

  it('creates a new decision with trimmed values', async () => {
    await setup();
    page.title = '  Nueva tienda ';
    page.description = 'Una descripción suficiente';
    page.alternatives.set([' Shopify ', 'Wix']);
    page.submit();
    expect(api.createDecision).toHaveBeenCalledWith({
      title: 'Nueva tienda',
      description: 'Una descripción suficiente',
      context: '',
      alternatives: ['Shopify', 'Wix']
    });
  });

  it('loads and updates an existing decision in edit mode', async () => {
    await setup('5');
    expect(page.editingId()).toBe(5);
    expect(page.title).toBe('Tienda en línea');
    expect(page.alternatives()).toEqual(['WooCommerce', 'Shopify']);

    page.submit();
    expect(api.updateDecision).toHaveBeenCalledWith(5, expect.objectContaining({
      alternatives: ['WooCommerce', 'Shopify']
    }));
    expect(api.createDecision).not.toHaveBeenCalled();
  });
});
