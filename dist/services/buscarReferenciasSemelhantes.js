"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarReferenciasSemelhantes = buscarReferenciasSemelhantes;
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
const embeddingService_1 = require("./embeddingService");
async function buscarReferenciasSemelhantes(userId, entrada) {
    try {
        if (!entrada?.trim())
            return [];
        const vetorConsulta = await (0, embeddingService_1.embedTextoCompleto)(entrada, 'referencia');
        if (!vetorConsulta || !Array.isArray(vetorConsulta)) {
            console.error('❌ Vetor de embedding inválido.');
            return [];
        }
        const { data, error } = await supabaseAdmin_1.supabaseAdmin.rpc('buscar_referencias_similares', {
            usuario_id: userId,
            query_embedding: vetorConsulta,
            match_threshold: 0.75,
            match_count: 5
        });
        if (error) {
            console.error('❌ Erro ao buscar referências similares via RPC:', error.message);
            return [];
        }
        return data || [];
    }
    catch (err) {
        console.error('❌ Erro inesperado ao buscar referências semelhantes:', err.message);
        return [];
    }
}
//# sourceMappingURL=buscarReferenciasSemelhantes.js.map