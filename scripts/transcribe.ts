// server/scripts/transcribe.ts
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function transcribeWithWhisper(buffer: Buffer): Promise<string> {
  const tempDir = os.tmpdir();
  const audioPath = path.join(tempDir, `eco-${Date.now()}.webm`);
  await fs.promises.writeFile(audioPath, buffer);

  return new Promise((resolve, reject) => {
    const python = spawn('python', ['scripts/whisper_runner.py', audioPath]);

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      fs.unlink(audioPath, () => {}); // limpa o arquivo temporário
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Erro ao transcrever áudio: ${errorOutput}`));
      }
    });
  });
}
