import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
const VOICE_ID = process.env.ELEVEN_VOICE_ID;

if (!ELEVEN_API_KEY) {
  throw new Error('❌ ELEVEN_API_KEY não está definida no .env');
}

if (!VOICE_ID) {
  throw new Error('❌ ELEVEN_VOICE_ID não está definida no .env');
}

export async function generateAudio(text: string): Promise<Buffer> {
  if (!text || typeof text !== 'string') {
    throw new Error('Texto inválido para conversão em áudio.');
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVEN_API_KEY!, // ✅ garante que não é undefined
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2', // ✅ ótimo para português
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.9,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[TTS Error ElevenLabs]', errorText);
    throw new Error(`Erro ElevenLabs: ${response.status} - ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
