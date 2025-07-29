"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAskEco = void 0;
const openrouter_1 = require("../services/openrouter");
const handleAskEco = async (req, res) => {
    try {
        const userMessages = req.body.messages;
        const userName = req.body.userName;
        if (!userMessages || !Array.isArray(userMessages)) {
            return res.status(400).json({ error: 'Por favor, forneça um array de mensagens.' });
        }
        const response = await (0, openrouter_1.askOpenRouter)(userMessages, userName);
        res.json({ response });
    }
    catch (error) {
        console.error('Erro ao processar requisição da OpenRouter:', error);
        res.status(500).json({ error: 'Erro ao comunicar com a OpenRouter.' });
    }
};
exports.handleAskEco = handleAskEco;
//# sourceMappingURL=openrouterController.js.map