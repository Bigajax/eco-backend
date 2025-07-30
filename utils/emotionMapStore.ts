import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, '../data/emotionCoordinates.json');

if (!fs.existsSync(filePath)) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, '{}', 'utf-8');
}

export function loadEmotionStore(): Record<string, { valencia: number; excitacao: number }> {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('⚠️ Erro lendo emotionCoordinates.json', err);
    return {};
  }
}

export function saveEmotionStore(data: Record<string, { valencia: number; excitacao: number }>) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('⚠️ Erro escrevendo emotionCoordinates.json', err);
  }
}
