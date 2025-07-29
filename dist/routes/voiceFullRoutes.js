"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const elevenlabsService_1 = require("../services/elevenlabsService");
const ecoCortex_1 = require("../services/ecoCortex");
const transcribe_1 = require("../scripts/transcribe");
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
router.post('/transcribe-and-respond', upload.single('audio'), async (req, res) => {
    try {
        const audioFile = req.file;
        const { nome_usuario, usuario_id, mensagens, access_token } = req.body;
        if (!audioFile || !access_token) {
            return res.status(400).json({ error: 'Áudio e token são obrigatórios.' });
        }
        console.log('📥 Dados recebidos:', {
            nome_usuario,
            usuario_id,
            audioMime: audioFile.mimetype,
            audioSize: audioFile.size
        });
        // 1. Transcreve o áudio
        console.log('📝 Iniciando transcrição...');
        const userText = await (0, transcribe_1.transcribeWithWhisper)(audioFile.buffer);
        console.log('[✅ Transcrição Whisper]', userText);
        // 2. Constrói histórico para a IA
        let mensagensFormatadas;
        try {
            const parsed = mensagens ? JSON.parse(mensagens) : [];
            mensagensFormatadas = parsed.length > 0
                ? parsed
                : [{ id: `voice-${Date.now()}`, role: 'user', content: userText }];
        }
        catch {
            mensagensFormatadas = [{ id: `voice-${Date.now()}`, role: 'user', content: userText }];
        }
        console.log('🧠 Histórico para IA:', mensagensFormatadas);
        // 3. Gera resposta da IA
        console.log('🤖 Chamando getEcoResponse...');
        const ecoResponse = await (0, ecoCortex_1.getEcoResponse)({
            messages: mensagensFormatadas,
            userId: usuario_id || 'anon',
            accessToken: access_token
        });
        console.log('[✅ Resposta da IA]', ecoResponse.message);
        // 4. Gera o áudio da resposta
        console.log('🎙️ Gerando áudio da resposta...');
        const audioBuffer = await (0, elevenlabsService_1.generateAudio)(ecoResponse.message);
        console.log('[✅ Áudio gerado]');
        // 5. Retorna os dados
        res.json({
            userText,
            ecoText: ecoResponse.message,
            audioBase64: audioBuffer.toString('base64'),
        });
    }
    catch (err) {
        console.error('[❌ Erro no fluxo de voz]', err);
        res.status(500).json({ error: 'Erro no fluxo de voz completo' });
    }
});
router.post('/ask-eco', async (req, res) => {
    const { usuario_id, mensagem, mensagens, access_token } = req.body;
    if (!usuario_id || (!mensagem && !mensagens)) {
        return res.status(400).json({ error: "usuario_id e mensagens são obrigatórios." });
    }
    if (!access_token) {
        return res.status(401).json({ error: "Token de acesso ausente." });
    }
    try {
        const mensagensParaIA = mensagens || [{ role: "user", content: mensagem }];
        const resposta = await (0, ecoCortex_1.getEcoResponse)({
            messages: mensagensParaIA,
            userId: usuario_id,
            accessToken: access_token
        });
        return res.status(200).json({ message: resposta.message });
    }
    catch (err) {
        console.error("❌ Erro no /ask-eco:", err.message || err);
        return res.status(500).json({ error: "Erro interno ao processar a requisição." });
    }
});
exports.default = router;
//# sourceMappingURL=voiceFullRoutes.js.map