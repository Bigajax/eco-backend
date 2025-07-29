"use strict";
// services/registrarTodasHeuristicas.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarTodasHeuristicas = registrarTodasHeuristicas;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const embeddingService_1 = require("./embeddingService");
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
// 🔧 Caminho corrigido
const heuristicasDir = path_1.default.join(__dirname, '../assets/modulos_cognitivos');
async function registrarTodasHeuristicas() {
    try {
        const arquivos = await promises_1.default.readdir(heuristicasDir);
        for (const arquivo of arquivos) {
            const caminho = path_1.default.join(heuristicasDir, arquivo);
            const conteudo = await promises_1.default.readFile(caminho, 'utf-8');
            // ⚠️ Checar se já está registrado
            const { data: existente, error: buscaErro } = await supabaseAdmin_1.supabaseAdmin
                .from('heuristicas_embeddings')
                .select('id')
                .eq('arquivo', arquivo)
                .single();
            if (existente) {
                console.log(`📌 ${arquivo} já está registrado — pulando.`);
                continue;
            }
            if (buscaErro && buscaErro.code !== 'PGRST116') {
                console.error(`Erro ao verificar duplicidade de ${arquivo}:`, buscaErro.message);
                continue;
            }
            const embedding = await (0, embeddingService_1.embedTextoCompleto)(conteudo, '🔍 heuristica');
            const { error: insercaoErro } = await supabaseAdmin_1.supabaseAdmin
                .from('heuristicas_embeddings')
                .insert([{
                    arquivo,
                    embedding,
                    tags: [], // ajuste se desejar
                    tipo: 'cognitiva'
                }]);
            if (insercaoErro) {
                console.error(`❌ Falha ao inserir ${arquivo}:`, insercaoErro.message);
            }
            else {
                console.log(`✅ Heurística registrada: ${arquivo}`);
            }
        }
    }
    catch (err) {
        console.error('❌ Erro ao registrar heurísticas:', err.message);
    }
}
//# sourceMappingURL=registrarTodasHeuristicas.js.map