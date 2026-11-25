import { AgentResult, AlternativeComparison, Decision } from '../../core/api.service';

/** Spanish names of the agents returned by the backend. */
const AGENT_LABELS: Record<string, string> = {
  'Financial Agent': 'Financiero',
  'Technology Agent': 'Tecnológico',
  'Human Impact Agent': 'Impacto humano',
  'Risk Agent': 'Riesgos',
  'Analyst Agent': 'Analista'
};

export function agentLabel(name: string): string {
  return AGENT_LABELS[name] ?? name.replace(' Agent', '');
}

export type EvaluationSource = 'ai' | 'rules' | 'unknown';

/** Whether an agent evaluated with validated AI output or with its rules. */
export function evaluationSource(agent: AgentResult): EvaluationSource {
  const observations = (agent.observations ?? []).join(' ').toLowerCase();
  if (observations.includes('generada con ia')) {
    return 'ai';
  }
  if (observations.includes('reglas')) {
    return 'rules';
  }
  return 'unknown';
}

/** Observations that are not the technical source marker. */
export function visibleObservations(agent: AgentResult): string[] {
  return (agent.observations ?? []).filter(observation => {
    const text = observation.toLowerCase();
    return !text.startsWith('evaluación generada con');
  });
}

/** Minimum score gap between agents to call it a disagreement. */
export const DISAGREEMENT_THRESHOLD = 4;

export interface Disagreement {
  alternative: string;
  highest: { agent: string; score: number };
  lowest: { agent: string; score: number };
}

/** Alternatives on which the specialists strongly disagree. */
export function findDisagreements(
  comparison: AlternativeComparison[]
): Disagreement[] {
  const result: Disagreement[] = [];

  for (const item of comparison) {
    const entries = Object.entries(item.criteria ?? {});
    if (entries.length < 2) {
      continue;
    }
    const sorted = [...entries].sort((a, b) => b[1] - a[1]);
    const [highAgent, highScore] = sorted[0];
    const [lowAgent, lowScore] = sorted[sorted.length - 1];

    if (highScore - lowScore >= DISAGREEMENT_THRESHOLD) {
      result.push({
        alternative: item.alternative,
        highest: { agent: highAgent, score: highScore },
        lowest: { agent: lowAgent, score: lowScore }
      });
    }
  }

  return result;
}

/** Same thresholds the analyst agent uses in the backend. */
export const MIN_DESCRIPTION_LENGTH = 60;

/** Missing information that makes the evaluation less reliable. */
export function findInformationGaps(decision: Decision): string[] {
  const gaps: string[] = [];

  if ((decision.description ?? '').trim().length < MIN_DESCRIPTION_LENGTH) {
    gaps.push('La descripción es breve: agrega objetivos, alcance y restricciones.');
  }
  if (!(decision.context ?? '').trim()) {
    gaps.push('Falta contexto: presupuesto, plazos, equipo o infraestructura actual.');
  }
  if ((decision.alternatives ?? []).length < 2) {
    gaps.push('Agrega al menos dos alternativas para poder compararlas.');
  }

  return gaps;
}
