"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribeWithWhisper = transcribeWithWhisper;
// server/scripts/transcribe.ts
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
async function transcribeWithWhisper(buffer) {
    const tempDir = os_1.default.tmpdir();
    const audioPath = path_1.default.join(tempDir, `eco-${Date.now()}.webm`);
    await fs_1.default.promises.writeFile(audioPath, buffer);
    return new Promise((resolve, reject) => {
        const python = (0, child_process_1.spawn)('python', ['scripts/whisper_runner.py', audioPath]);
        let output = '';
        let errorOutput = '';
        python.stdout.on('data', (data) => {
            output += data.toString();
        });
        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        python.on('close', (code) => {
            fs_1.default.unlink(audioPath, () => { }); // limpa o arquivo temporário
            if (code === 0) {
                resolve(output.trim());
            }
            else {
                reject(new Error(`Erro ao transcrever áudio: ${errorOutput}`));
            }
        });
    });
}
//# sourceMappingURL=transcribe.js.map