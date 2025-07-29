"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarUltimaReferenciaOuMemoria = buscarUltimaReferenciaOuMemoria;
exports.salvarMemoriaComEncadeamento = salvarMemoriaComEncadeamento;
exports.salvarReferenciaComEncadeamento = salvarReferenciaComEncadeamento;
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
/**
 * Busca a última memória ou referência para um usuário,
 * retornando { id, created_at } se houver, ou null se não houver nada.
 */
async function buscarUltimaReferenciaOuMemoria(usuario_id) {
    try {
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .rpc('buscar_ultima_memoria_ou_referencia', { usuario_id_input: usuario_id }) // ajuste de nome!
            .single();
        if (error) {
            console.warn('⚠️ Erro ao buscar última memória/referência:', error.message);
            return null;
        }
        if (!data) {
            console.log('ℹ️ Nenhuma memória/referência anterior encontrada.');
            return null;
        }
        console.log('✅ Última memória/referência encontrada:', data);
        return data;
    }
    catch (err) {
        console.error('❌ Erro inesperado em buscarUltimaReferenciaOuMemoria:', err.message);
        return null;
    }
}
/**
 * Salva uma nova memória encadeada, referenciando a anterior se existir.
 */
async function salvarMemoriaComEncadeamento(mem) {
    try {
        const anterior = await buscarUltimaReferenciaOuMemoria(mem.usuario_id);
        const payload = {
            usuario_id: mem.usuario_id,
            resumo_eco: mem.resumo_eco,
            intensidade: mem.intensidade,
            emocao_principal: mem.emocao_principal ?? null,
            tags: mem.tags ?? null,
            referencia_anterior_id: anterior?.id ?? null,
            created_at: new Date().toISOString()
        };
        const { error } = await supabaseAdmin_1.supabaseAdmin.from('memories').insert(payload);
        if (error) {
            console.error('❌ Erro ao salvar memória encadeada:', error.message);
        }
        else {
            console.log('✅ Memória salva com encadeamento:', payload);
        }
    }
    catch (err) {
        console.error('❌ Erro inesperado em salvarMemoriaComEncadeamento:', err.message);
    }
}
/**
 * Salva uma nova referência temporária encadeada, referenciando a anterior se existir.
 */
async function salvarReferenciaComEncadeamento(mem) {
    try {
        const anterior = await buscarUltimaReferenciaOuMemoria(mem.usuario_id);
        const payload = {
            usuario_id: mem.usuario_id,
            resumo_eco: mem.resumo_eco,
            intensidade: mem.intensidade,
            emocao_principal: mem.emocao_principal ?? null,
            tags: mem.tags ?? null,
            referencia_anterior_id: anterior?.id ?? null,
            created_at: new Date().toISOString()
        };
        const { error } = await supabaseAdmin_1.supabaseAdmin.from('referencias_temporarias').insert(payload);
        if (error) {
            console.error('❌ Erro ao salvar referência encadeada:', error.message);
        }
        else {
            console.log('✅ Referência temporária salva com encadeamento:', payload);
        }
    }
    catch (err) {
        console.error('❌ Erro inesperado em salvarReferenciaComEncadeamento:', err.message);
    }
}
//# sourceMappingURL=encadeamentoService.js.map