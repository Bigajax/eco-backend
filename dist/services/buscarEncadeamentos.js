"use strict";
// server/services/buscarEncadeamentos.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarEncadeamentosPassados = buscarEncadeamentosPassados;
const supabase_js_1 = require("@supabase/supabase-js");
const embeddingService_1 = require("./embeddingService");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
async function buscarEncadeamentosPassados(userId, entrada) {
    try {
        const queryEmbedding = await (0, embeddingService_1.embedTextoCompleto)(entrada, '🔗 encadeamento');
        const { data, error } = await supabase.rpc('buscar_encadeamentos_semelhantes', {
            entrada_embedding: queryEmbedding,
            id_usuario: userId
        });
        if (error) {
            console.error('Erro ao buscar encadeamentos via RPC:', error.message);
            return [];
        }
        return data || [];
    }
    catch (e) {
        console.error('Erro inesperado em buscarEncadeamentosPassados:', e.message);
        return [];
    }
}
//# sourceMappingURL=buscarEncadeamentos.js.map