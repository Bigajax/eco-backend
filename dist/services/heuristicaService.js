"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarHeuristicasSemelhantes = buscarHeuristicasSemelhantes;
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
const embeddingService_1 = require("./embeddingService");
/**
 * Busca heurísticas semânticas semelhantes usando embeddings.
 *
 * @param texto - Texto de entrada para gerar o embedding.
 * @param usuarioId - ID do usuário para filtrar heurísticas personalizadas (ou null para globais).
 * @param threshold - Limite de similaridade (default: 0.75).
 * @param matchCount - Quantidade de heurísticas retornadas (default: 5).
 * @returns Lista de heurísticas filtradas por tipo.
 */
async function buscarHeuristicasSemelhantes(texto, usuarioId = null, threshold = 0.75, matchCount = 5) {
    try {
        if (!texto?.trim()) {
            console.warn("⚠️ Texto de entrada vazio ou inválido.");
            return [];
        }
        // ✅ Gerar embedding do texto de entrada
        const query_embedding = await (0, embeddingService_1.embedTextoCompleto)(texto, "🔍 heuristica");
        if (!query_embedding || !Array.isArray(query_embedding)) {
            console.error("❌ Embedding gerado inválido.");
            return [];
        }
        // ✅ Chamada RPC sempre passando input_usuario_id (mesmo null)
        const response = await supabaseAdmin_1.supabaseAdmin.rpc("buscar_heuristica_semelhante", {
            query_embedding,
            match_threshold: threshold,
            match_count: matchCount,
            input_usuario_id: usuarioId
        });
        if (response.error) {
            console.error("❌ Erro RPC heurística:", response.error.message);
            return [];
        }
        const data = response.data;
        // ✅ Filtra apenas heurísticas dos tipos desejados
        return (data ?? []).filter((item) => ["cognitiva", "filosofico"].includes(item.tipo));
    }
    catch (err) {
        console.error("❌ Erro inesperado ao gerar embedding ou buscar heurísticas:", err.message);
        return [];
    }
}
//# sourceMappingURL=heuristicaService.js.map