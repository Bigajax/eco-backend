"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
const ecoCortex_1 = require("../services/ecoCortex");
const embeddingService_1 = require("../services/embeddingService");
const router = express_1.default.Router();
router.post("/ask-eco", async (req, res) => {
    const { usuario_id, mensagem, messages, mensagens, nome_usuario, } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token de acesso ausente." });
    }
    const token = authHeader.replace("Bearer ", "").trim();
    const mensagensParaIA = messages ||
        mensagens ||
        (mensagem ? [{ role: "user", content: mensagem }] : null);
    if (!usuario_id || !mensagensParaIA) {
        return res
            .status(400)
            .json({ error: "usuario_id e messages são obrigatórios." });
    }
    try {
        const { data, error } = await supabaseAdmin_1.supabaseAdmin.auth.getUser(token);
        if (error || !data?.user) {
            return res
                .status(401)
                .json({ error: "Token inválido ou usuário não encontrado." });
        }
        // 🌱 1. Gera embedding da última mensagem
        const ultimaMsg = mensagensParaIA.at(-1)?.content ?? "";
        const queryEmbedding = await (0, embeddingService_1.embedTextoCompleto)(ultimaMsg);
        // 🌱 2. Busca memórias semanticamente semelhantes
        let memsSimilares = [];
        if (queryEmbedding) {
            const { data: memData, error: memErr } = await supabaseAdmin_1.supabaseAdmin.rpc("buscar_memorias_semelhantes", {
                consulta_embedding: queryEmbedding,
                filtro_usuario: usuario_id,
                limite: 5,
            });
            if (memErr) {
                console.warn("[ℹ️] Falha na busca de memórias semelhantes:", memErr);
            }
            else {
                memsSimilares = memData || [];
                console.log("[ℹ️] Memórias semelhantes retornadas:", memsSimilares);
            }
        }
        /* ---------------------------------------------------- */
        /* 🔥 3. PRIMEIRA RODADA — sem forçar METODO_VIVA       */
        /* ---------------------------------------------------- */
        const resposta1 = await (0, ecoCortex_1.getEcoResponse)({
            messages: mensagensParaIA,
            userId: usuario_id,
            userName: nome_usuario,
            accessToken: token,
            mems: memsSimilares,
        });
        console.log("✅ Resposta 1 gerada.");
        // 🌱 4. Tenta extrair o bloco técnico JSON do texto
        let blocoTecnico = null;
        try {
            const jsonMatch = resposta1.message.match(/\{[\s\S]*?\}$/);
            if (jsonMatch) {
                blocoTecnico = JSON.parse(jsonMatch[0]);
                console.log("✅ Bloco técnico extraído:", blocoTecnico);
            }
            else {
                console.log("ℹ️ Nenhum bloco técnico encontrado.");
            }
        }
        catch (err) {
            console.warn("⚠️ Erro ao tentar parsear bloco técnico:", err);
        }
        // 🌱 5. Decide se precisa rodar a SEGUNDA RODADA com METODO_VIVA
        let ativaViva = false;
        if (blocoTecnico) {
            const intensidade = blocoTecnico.intensidade ?? 0;
            const nivelAbertura = blocoTecnico.nivel_abertura === "alto"
                ? 3
                : blocoTecnico.nivel_abertura === "médio"
                    ? 2
                    : 1;
            if (intensidade >= 7 || (intensidade >= 5 && nivelAbertura === 3)) {
                ativaViva = true;
                console.log("✅ Critérios para ativar METODO_VIVA atingidos.");
            }
            else {
                console.log("ℹ️ Critérios para VIVA não atendidos.");
            }
        }
        if (!ativaViva) {
            // 🎯 Não precisa VIVA, retorna a primeira resposta
            return res.status(200).json({ message: resposta1.message });
        }
        /* ---------------------------------------------------- */
        /* 🔥 6. SEGUNDA RODADA — com METODO_VIVA forçado       */
        /* ---------------------------------------------------- */
        console.log("🔄 Rodada 2 com METODO_VIVA.txt forçado!");
        const resposta2 = await (0, ecoCortex_1.getEcoResponse)({
            messages: mensagensParaIA,
            userId: usuario_id,
            userName: nome_usuario,
            accessToken: token,
            mems: memsSimilares,
            blocoTecnicoForcado: blocoTecnico,
            forcarMetodoViva: true
        });
        return res.status(200).json({ message: resposta2.message });
    }
    catch (err) {
        console.error("❌ Erro no /ask-eco:", err);
        return res.status(500).json({
            error: "Erro interno ao processar a requisição.",
            details: {
                message: err?.message,
                stack: err?.stack,
                raw: err,
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=openrouterRoutes.js.map