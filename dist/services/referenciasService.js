"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salvarReferenciaTemporaria = salvarReferenciaTemporaria;
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
async function salvarReferenciaTemporaria(bloco) {
    const payload = {
        ...bloco,
        salvar_memoria: false,
        created_at: new Date().toISOString(), // ✅ substituído aqui
        mensagem_id: bloco.mensagem_id ?? null,
        referencia_anterior_id: bloco.referencia_anterior_id ?? null,
        dominio_vida: bloco.dominio_vida ?? null,
        padrao_comportamental: bloco.padrao_comportamental ?? null,
        nivel_abertura: bloco.nivel_abertura ?? null,
        analise_resumo: bloco.analise_resumo ?? null,
        categoria: bloco.categoria ?? null,
        tags: bloco.tags ?? null
    };
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('referencias_temporarias')
        .insert([payload]);
    if (error) {
        console.error('Erro ao salvar referência temporária:', error.message);
        throw error;
    }
    return data;
}
//# sourceMappingURL=referenciasService.js.map