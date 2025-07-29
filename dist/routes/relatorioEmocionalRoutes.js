"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const relatorioEmocionalUtils_1 = require("../utils/relatorioEmocionalUtils");
const router = express_1.default.Router();
router.get('/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const relatorio = await (0, relatorioEmocionalUtils_1.gerarRelatorioEmocional)(usuario_id);
        res.json({ perfil: relatorio }); // ✅ Corrigido aqui
    }
    catch (err) {
        console.error('❌ Erro ao gerar relatório emocional:', err.message || err);
        res.status(500).json({ error: 'Erro ao gerar relatório emocional' });
    }
});
exports.default = router;
//# sourceMappingURL=relatorioEmocionalRoutes.js.map