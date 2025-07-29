"use strict";
// services/buscarMemorias.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarMemoriasSemelhantes = buscarMemoriasSemelhantes;
const embeddingService_1 = require("./embeddingService");
const supabaseAdmin_1 = require("../lib/supabaseAdmin"); // ✅ Caminho e nome corretos
/**
 * Busca memórias semanticamente semelhantes no Supabase
 */
async function buscarMemoriasSemelhantes(userId, entrada) {
    if (!entrada || !userId)
        return [];
    try {
        const queryEmbedding = await (0, embeddingService_1.embedTextoCompleto)(entrada, 'entrada_usuario');
        const { data, error } = await supabaseAdmin_1.supabaseAdmin.rpc('buscar_memorias_semelhantes', {
            usuario_id: userId,
            query_embedding: queryEmbedding,
            match_threshold: 0.75, // ajuste conforme necessário
            match_count: 6 // limite de memórias
        });
        if (error) {
            console.error('Erro ao buscar memórias semelhantes:', error.message);
            return [];
        }
        return data || [];
    }
    catch (e) {
        console.error('❌ Erro interno ao buscar memórias:', e.message);
        return [];
    }
}
//# sourceMappingURL=buscarMemorias.js.map