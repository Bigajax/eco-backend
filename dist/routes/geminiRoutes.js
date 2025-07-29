"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const geminiService_1 = require("../services/geminiService");
const router = (0, express_1.Router)();
/**
 * Rota para interação com a Eco via Google Gemini.
 * Agora espera também: messages (array), userName (string), userId (string)
 */
router.post('/ask-gemini', async (req, res) => {
    try {
        await (0, geminiService_1.askGemini)(req, res);
    }
    catch (error) {
        console.error('Erro no handler de rota /ask-gemini:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
});
exports.default = router;
//# sourceMappingURL=geminiRoutes.js.map