import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export async function transcribeWithWhisper(audioBuffer: Buffer): Promise<string> {
  const tempDir = os.tmpdir();
  const audioPath = path.join(tempDir, `eco-audio-${Date.now()}.webm`);
  fs.writeFileSync(audioPath, audioBuffer);

  return new Promise((resolve, reject) => {
    const python = spawn('python3', ['scripts/transcribe.py', audioPath]);

    let result = '';
    let error = '';

    python.stdout.on('data', data => {
      result += data.toString();
    });

    python.stderr.on('data', data => {
      error += data.toString();
    });

    python.on('close', code => {
      fs.unlinkSync(audioPath); // remove o arquivo temporário
      if (code === 0) {
        resolve(result.trim());
      } else {
        reject(`Erro no Whisper: ${error}`);
      }
    });
  });
}
