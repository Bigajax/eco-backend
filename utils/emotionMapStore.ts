import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, '../data/emotionCoordinates.json');

export function loadEmotionCoordinates() {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('⚠️ Erro lendo emotionCoordinates.json', err);
    return {};
  }
}

export function saveEmotionCoordinates(data: Record<string, any>) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('⚠️ Erro escrevendo emotionCoordinates.json', err);
  }
}

/**
 * Gera uma cor pastel consistente com base no nome
 */
export function generateConsistentPastelColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 50%, 80%)`;
}
