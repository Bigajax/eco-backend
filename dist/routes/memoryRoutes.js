"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
const embeddingService_1 = require("../services/embeddingService");
const heuristicaNivelAbertura_1 = require("../utils/heuristicaNivelAbertura");
const tagService_1 = require("../services/tagService");
const router = express_1.default.Router();
/* ────────────────────────────────────────────────
   🔐 Helper – extrai usuário autenticado (Bearer)
────────────────────────────────────────────────── */
async function getUsuarioAutenticado(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
        return null;
    const token = authHeader.replace('Bearer ', '').trim();
    const { data, error } = await supabaseAdmin_1.supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
        console.warn('[Auth] Falha ao obter usuário:', error?.message);
        return null;
    }
    return data.user;
}
/* ────────────────────────────────────────────────
   ✅ Função para gerar um resumoEco bem formatado
────────────────────────────────────────────────── */
function gerarResumoEco(texto, tags = [], intensidade, emocao_principal, analise_resumo) {
    let linhas = [`🗣️ "${texto.trim()}"`];
    if (tags?.length)
        linhas.push(`🏷️ Tags: ${tags.join(', ')}`);
    if (emocao_principal)
        linhas.push(`❤️ Emoção: ${emocao_principal}`);
    linhas.push(`🔥 Intensidade: ${intensidade}`);
    if (analise_resumo && analise_resumo.trim()) {
        linhas.push(`\n🧭 Resumo Analítico:\n${analise_resumo.trim()}`);
    }
    else {
        linhas.push(`⚠️ Sem análise detalhada disponível.`);
    }
    return linhas.join('\n');
}
/* ────────────────────────────────────────────────
   ✅ POST /api/memorias/registrar → salva memória ou referência
────────────────────────────────────────────────── */
router.post('/registrar', async (req, res) => {
    const user = await getUsuarioAutenticado(req);
    if (!user)
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
    const { texto, tags, intensidade, mensagem_id, emocao_principal, contexto, dominio_vida, padrao_comportamental, salvar_memoria = true, nivel_abertura, analise_resumo, categoria = 'emocional', } = req.body;
    if (!texto ||
        typeof intensidade !== 'number' ||
        (!Array.isArray(tags) && typeof tags !== 'object')) {
        return res
            .status(400)
            .json({ erro: 'Campos obrigatórios ausentes ou inválidos.' });
    }
    try {
        // 🟢 Decide a tabela com base na intensidade
        const destinoTabela = intensidade >= 7 ? 'memories' : 'referencias_temporarias';
        // ✅ Gerar tags automaticamente se não vieram
        let finalTags = Array.isArray(tags) ? tags : [];
        if (finalTags.length === 0) {
            finalTags = await (0, tagService_1.gerarTagsAutomaticasViaIA)(texto);
        }
        // ✅ Gerar os dois embeddings
        const embedding_semantico = await (0, embeddingService_1.embedTextoCompleto)(texto);
        const embedding_emocional = await (0, embeddingService_1.embedTextoCompleto)(analise_resumo ?? texto);
        // 🔎 Calcular heurística de abertura
        const nivelCalc = typeof nivel_abertura === 'number'
            ? nivel_abertura
            : (0, heuristicaNivelAbertura_1.heuristicaNivelAbertura)(texto);
        // 🗂️ Inserir no banco
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .from(destinoTabela)
            .insert([{
                usuario_id: user.id,
                mensagem_id: mensagem_id ?? null,
                resumo_eco: gerarResumoEco(texto, tags, intensidade, emocao_principal, analise_resumo),
                tags: finalTags,
                intensidade,
                emocao_principal: emocao_principal ?? null,
                contexto: contexto ?? null,
                dominio_vida: dominio_vida ?? null,
                padrao_comportamental: padrao_comportamental ?? null,
                salvar_memoria,
                nivel_abertura: nivelCalc,
                analise_resumo: analise_resumo ?? null,
                categoria,
                created_at: new Date().toISOString(),
                embedding_semantico,
                embedding_emocional,
            }])
            .select();
        if (error) {
            console.error('❌ Erro ao salvar:', error.message, error.details);
            return res.status(500).json({ erro: 'Erro ao salvar no Supabase.' });
        }
        console.log(`✅ Registro salvo em [${destinoTabela}]:`, data);
        return res.status(201).json({ sucesso: true, tabela: destinoTabela, data });
    }
    catch (err) {
        console.error('❌ Erro inesperado ao salvar:', err.message || err);
        return res.status(500).json({ erro: 'Erro inesperado no servidor.' });
    }
});
/* ────────────────────────────────────────────────
   ✅ GET /api/memorias → lista memórias salvas
────────────────────────────────────────────────── */
router.get('/', async (req, res) => {
    const user = await getUsuarioAutenticado(req);
    if (!user)
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    const { limite } = req.query;
    try {
        let query = supabaseAdmin_1.supabaseAdmin
            .from('memories')
            .select('*')
            .eq('usuario_id', user.id)
            .eq('salvar_memoria', true)
            .order('created_at', { ascending: false });
        if (limite) {
            const lim = Number(limite);
            if (!isNaN(lim) && lim > 0) {
                query = query.range(0, lim - 1);
            }
        }
        const { data, error } = await query;
        if (error) {
            console.error('❌ Erro ao buscar memórias:', error.message, error.details);
            return res.status(500).json({ error: 'Erro ao buscar memórias no Supabase.' });
        }
        const memoriesFiltradas = (data || []).filter((mem) => typeof mem.resumo_eco === 'string' &&
            mem.resumo_eco.trim() !== '' &&
            mem.created_at);
        console.log(`📥 ${memoriesFiltradas.length} memórias retornadas para ${user.id}`);
        return res.status(200).json({ success: true, memories: memoriesFiltradas });
    }
    catch (err) {
        console.error('❌ Erro inesperado ao buscar memórias:', err.message || err);
        return res.status(500).json({ error: 'Erro inesperado no servidor.' });
    }
});
/* ────────────────────────────────────────────────
   ✅ POST /api/memorias/similares → busca memórias similares
────────────────────────────────────────────────── */
router.post('/similares', async (req, res) => {
    const user = await getUsuarioAutenticado(req);
    if (!user)
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
    const { texto, analise_resumo, limite = 5 } = req.body;
    if (!texto || typeof texto !== 'string') {
        return res.status(400).json({ erro: 'Texto para análise é obrigatório.' });
    }
    try {
        // 🟢 Gerar embeddings de consulta
        const embedding_semantico = await (0, embeddingService_1.embedTextoCompleto)(texto);
        const embedding_emocional = await (0, embeddingService_1.embedTextoCompleto)(analise_resumo ?? texto);
        // 🟢 Chamar função RPC com priorização temporal + score duplo
        const { data, error } = await supabaseAdmin_1.supabaseAdmin.rpc('buscar_memorias_semelhantes', {
            consulta_embedding_semantico: embedding_semantico,
            consulta_embedding_emocional: embedding_emocional,
            filtro_usuario: user.id,
            limite,
        });
        if (error) {
            console.error('❌ Erro ao buscar memórias similares:', error.message, error.details);
            return res.status(500).json({ erro: 'Erro ao buscar memórias similares no Supabase.' });
        }
        console.log(`🔍 ${data?.length ?? 0} memórias semelhantes encontradas.`);
        return res.status(200).json({ sucesso: true, similares: data });
    }
    catch (err) {
        console.error('❌ Erro inesperado ao buscar similares:', err.message || err);
        return res.status(500).json({ erro: 'Erro inesperado no servidor.' });
    }
});
exports.default = router;
//# sourceMappingURL=memoryRoutes.js.map