export interface DiscAnswers {
  [questionId: string]: 'D' | 'I' | 'S' | 'C';
}

export interface DiscResult {
  dominance: number;
  influence: number;
  steadiness: number;
  conscientiousness: number;
  primary: string;
}

export function calculateDisc(answers: DiscAnswers): DiscResult {
  const counts = { D: 0, I: 0, S: 0, C: 0 };
  const total = Object.keys(answers).length;

  // Contabiliza cada resposta
  Object.values(answers).forEach((val) => {
    counts[val]++;
  });

  const result = {
    dominance: Math.round((counts.D / total) * 100),
    influence: Math.round((counts.I / total) * 100),
    steadiness: Math.round((counts.S / total) * 100),
    conscientiousness: Math.round((counts.C / total) * 100),
  };

  // Identifica o perfil predominante
  const primary = Object.entries(result).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

  return { ...result, primary };
}