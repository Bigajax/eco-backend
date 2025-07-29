/**
 * Remove emojis, símbolos gráficos e emoticons simples de um texto.
 */
export function stripEmojis(text: string): string {
  return text
    // Remove emojis Unicode padrão
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    // Remove símbolos gráficos comuns (como ✨, ❤️, ☀, ⚡)
    .replace(/[\u2600-\u26FF\u2700-\u27BF\u1F300-\u1F5FF\u1F600-\u1F64F\u1F680-\u1F6FF\u1F700-\u1F77F\u1F780-\u1F7FF\u1F800-\u1F8FF\u1F900-\u1F9FF\u1FA00-\u1FA6F\u1FA70-\u1FAFF]/gu, '')
    // Remove emoticons simples como :) ;-) :D :P
    .replace(/[:;=8][\-–]?[()D]/g, '');
}
