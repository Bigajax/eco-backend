export function heuristicaNivelAbertura(texto: string): number {
  /**
   * Heurística para estimar o nível de abertura emocional com base no conteúdo textual.
   * Retornos:
   * 1 = Superficial — saudações, agradecimentos, sem emoção ou exposição pessoal.
   * 2 = Médio       — relato neutro ou descritivo, com pouco envolvimento emocional.
   * 3 = Profundo    — presença de emoções fortes, verbos de sentir, palavras vulneráveis.
   */

  const superficial = /\b(obrigado|valeu|ol[áa]|bom\s*d[ia]|boa\s*tarde|boa\s*noite|tudo\s*bem)\b/i;
  const profundo = /\b(sinto|senti|não\s*aguento|vazio|perdido|exaust[ãa]o?|exaurid[oa]|feliz\s*(demais)?|triste(za)?|raiva|ang[úu]stia|culpa|medo|chorei|sofri|desespero)\b/i;

  if (profundo.test(texto)) return 3;
  if (superficial.test(texto)) return 1;
  return 2;
}
