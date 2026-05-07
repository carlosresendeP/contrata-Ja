export interface PersonalityAnswers {
  // O ID da pergunta mapeia para o eixo (E, I, S, N, T, F, J, P)
  [questionId: string]: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
}

export interface PersonalityResult {
  type: string; // Ex: "ENTJ", "ISFP"
  scores: { [key: string]: number };
}

export function calculatePersonalities(answers: PersonalityAnswers): PersonalityResult {
  const counts: { [key: string]: number } = {
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
  };

  // Contabiliza os pontos para cada letra
  Object.values(answers).forEach((val) => {
    if (counts[val] !== undefined) counts[val]++;
  });

  // Determina a letra vencedora de cada par
  const type = [
    counts.E >= counts.I ? 'E' : 'I',
    counts.S >= counts.N ? 'S' : 'N',
    counts.T >= counts.F ? 'T' : 'F',
    counts.J >= counts.P ? 'J' : 'P'
  ].join('');

  return {
    type,
    scores: counts
  };
}