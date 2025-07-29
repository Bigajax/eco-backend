"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarHeuristicaPorSimilaridade = buscarHeuristicaPorSimilaridade;
const embeddingService_1 = require("./embeddingService");
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
async function buscarHeuristicaPorSimilaridade(mensagem, usuarioId, threshold = 0.83, matchCount = 3) {
    if (!mensagem?.trim()) {
        console.warn("⚠️ Mensagem vazia ou inválida para fuzzy search.");
        return [];
    }
    try {
        const queryEmbedding = await (0, embeddingService_1.embedTextoCompleto)(mensagem, 'entrada_usuario');
        const { data, error } = await supabaseAdmin_1.supabaseAdmin.rpc('buscar_heuristica_semelhante', {
            query_embedding: queryEmbedding,
            match_threshold: threshold,
            match_count: matchCount,
            input_usuario_id: usuarioId ?? null
        });
        if (error) {
            console.error('❌ Erro na busca fuzzy de heurística:', error.message);
            return [];
        }
        if (data && data.length) {
            console.log(`✅ ${data.length} heurística(s) fuzzy encontradas:`);
            data.forEach((d, idx) => {
                console.log(`• #${idx + 1}: ${d.arquivo} (similaridade: ${d.similaridade?.toFixed(3)})`);
            });
        }
        else {
            console.log('ℹ️ Nenhuma heurística fuzzy encontrada acima do threshold.');
        }
        return data ?? [];
    }
    catch (err) {
        console.error('❌ Erro inesperado em buscarHeuristicaPorSimilaridade:', err.message || err);
        return [];
    }
}
//# sourceMappingURL=heuristicaFuzzyService.js.map