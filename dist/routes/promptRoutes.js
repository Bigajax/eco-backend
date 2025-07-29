"use strict";
// server/routes/promptRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const promptController_1 = require("../controllers/promptController");
const router = (0, express_1.Router)();
console.log('Backend: promptRoutes carregado.');
/**
 * GET /api/prompt-preview
 * Retorna o prompt final com base no estado atual (para testes/debug).
 */
router.get('/prompt-preview', async (req, res) => {
    try {
        await (0, promptController_1.getPromptEcoPreview)(req, res);
    }
    catch (error) {
        console.error('Erro no handler de rota /prompt-preview:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erro interno ao montar o prompt.' });
        }
    }
});
exports.default = router;
//# sourceMappingURL=promptRoutes.js.map