"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relatorioEmocionalHandler = void 0;
const gerarRelatorioEmocional_1 = require("../services/gerarRelatorioEmocional");
const relatorioEmocionalHandler = async (req, res) => {
    const { usuario_id } = req.query;
    if (!usuario_id || typeof usuario_id !== 'string') {
        return res.status(400).json({ erro: 'Usuário não especificado' });
    }
    try {
        const relatorio = await (0, gerarRelatorioEmocional_1.gerarRelatorioEmocional)(usuario_id);
        res.status(200).json(relatorio);
    }
    catch (err) {
        console.error('Erro no relatório emocional:', err);
        res.status(500).json({ erro: 'Erro ao gerar relatório emocional' });
    }
};
exports.relatorioEmocionalHandler = relatorioEmocionalHandler;
//# sourceMappingURL=relatorioEmocionalController.js.map