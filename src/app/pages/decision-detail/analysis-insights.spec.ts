import { AgentResult, AlternativeComparison, Decision } from '../../core/api.service';
import {
  agentLabel,
  evaluationSource,
  findDisagreements,
  findInformationGaps,
  visibleObservations
} from './analysis-insights';

function agent(observations: string[]): AgentResult {
  return { agent: 'Financial Agent', analysis: '', observations };
}

function comparison(
  alternative: string,
  criteria: Record<string, number>
): AlternativeComparison {
  return { alternative, criteria, weighted_score: 0 };
}

const COMPLETE_DECISION: Decision = {
  id: 1,
  user_id: 1,
  title: 'Tienda en línea',
  description: 'Elegir la plataforma de comercio electrónico para vender a todo el país durante 2027.',
  context: 'Presupuesto limitado',
  alternatives: ['WooCommerce', 'Shopify'],
  status: 'pending'
};

describe('analysis-insights', () => {
  it('translates agent names to Spanish', () => {
    expect(agentLabel('Human Impact Agent')).toBe('Impacto humano');
    expect(agentLabel('Custom Agent')).toBe('Custom');
  });

  it('detects whether an agent used AI or rules', () => {
    expect(evaluationSource(agent(['Evaluación generada con IA (Groq) y validada.']))).toBe('ai');
    expect(evaluationSource(agent(['Evaluación generada con reglas heurísticas (IA no disponible).']))).toBe('rules');
    expect(evaluationSource(agent([]))).toBe('unknown');
  });

  it('hides the technical source marker from the observations', () => {
    const observations = visibleObservations(
      agent(['Evaluación generada con IA (Groq) y validada.', 'Información faltante: costos'])
    );
    expect(observations).toEqual(['Información faltante: costos']);
  });

  it('finds alternatives with a large score gap between agents', () => {
    const result = findDisagreements([
      comparison('A', { 'Financial Agent': 9, 'Risk Agent': 3 }),
      comparison('B', { 'Financial Agent': 6, 'Risk Agent': 5 })
    ]);
    expect(result.map(item => item.alternative)).toEqual(['A']);
    expect(result[0].highest).toEqual({ agent: 'Financial Agent', score: 9 });
    expect(result[0].lowest).toEqual({ agent: 'Risk Agent', score: 3 });
  });

  it('reports no gaps for a complete decision', () => {
    expect(findInformationGaps(COMPLETE_DECISION)).toEqual([]);
  });

  it('reports every missing piece of information', () => {
    const gaps = findInformationGaps({
      ...COMPLETE_DECISION,
      description: 'Corta',
      context: '',
      alternatives: ['Única']
    });
    expect(gaps.length).toBe(3);
  });
});
