"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribeWithWhisper = transcribeWithWhisper;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
async function transcribeWithWhisper(audioBuffer) {
    const tempDir = os_1.default.tmpdir();
    const audioPath = path_1.default.join(tempDir, `eco-audio-${Date.now()}.webm`);
    fs_1.default.writeFileSync(audioPath, audioBuffer);
    return new Promise((resolve, reject) => {
        const python = (0, child_process_1.spawn)('python3', ['scripts/transcribe.py', audioPath]);
        let result = '';
        let error = '';
        python.stdout.on('data', data => {
            result += data.toString();
        });
        python.stderr.on('data', data => {
            error += data.toString();
        });
        python.on('close', code => {
            fs_1.default.unlinkSync(audioPath); // remove o arquivo temporário
            if (code === 0) {
                resolve(result.trim());
            }
            else {
                reject(`Erro no Whisper: ${error}`);
            }
        });
    });
}
//# sourceMappingURL=whisperService.js.map