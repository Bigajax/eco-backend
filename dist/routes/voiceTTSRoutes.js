"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const elevenlabsService_1 = require("../services/elevenlabsService");
const router = express_1.default.Router();
router.post('/tts', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Texto inválido ou ausente' });
        }
        const audioBuffer = await (0, elevenlabsService_1.generateAudio)(text);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(audioBuffer);
    }
    catch (err) {
        console.error('[TTS Error]', err);
        res.status(500).json({ error: 'Erro ao gerar áudio' });
    }
});
exports.default = router;
//# sourceMappingURL=voiceTTSRoutes.js.map