export interface EneagramaAnswers {
  [questionId: string]: number; // O ID da pergunta mapeia para o Tipo (1 a 9)
}

export interface EneagramaResult {
  scores: { [type: number]: number };
  primaryType: number;
}

export function calculateEneagrama(answers: EneagramaAnswers): EneagramaResult {
  const scores: { [key: number]: number } = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  };

  // Soma os pontos para cada tipo correspondente
  Object.values(answers).forEach((type) => {
    if (scores[type] !== undefined) {
      scores[type]++;
    }
  });

  // Encontra o tipo com a maior pontuação
  const primaryType = Number(
    Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
  );

  return { scores, primaryType };
}