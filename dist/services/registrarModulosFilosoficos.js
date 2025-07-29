"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarModulosFilosoficos = registrarModulosFilosoficos;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const supabase_js_1 = require("@supabase/supabase-js");
const embeddingService_1 = require("../services/embeddingService");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
// Caminho correto da pasta
const pastaModulos = path_1.default.join(process.cwd(), 'assets/modulos_filosoficos');
async function registrarModulosFilosoficos() {
    let arquivos;
    try {
        arquivos = await promises_1.default.readdir(pastaModulos);
    }
    catch (err) {
        console.error('❌ Erro ao ler a pasta de módulos filosóficos:', err.message);
        return;
    }
    let inseridos = 0;
    let pulados = 0;
    for (const arquivo of arquivos) {
        try {
            const conteudo = await promises_1.default.readFile(path_1.default.join(pastaModulos, arquivo), 'utf-8');
            const { data: jaExiste } = await supabase
                .from('heuristicas_embeddings')
                .select('id')
                .eq('arquivo', arquivo)
                .eq('tipo', 'filosofico')
                .maybeSingle();
            if (jaExiste) {
                console.log(`🟡 Já registrado: ${arquivo}`);
                pulados++;
                continue;
            }
            const embedding = await (0, embeddingService_1.embedTextoCompleto)(conteudo, `💠 ${arquivo}`);
            const { error } = await supabase.from('heuristicas_embeddings').insert({
                arquivo,
                embedding,
                tags: [], // ← insira tags se quiser
                tipo: 'filosofico'
            });
            if (error) {
                console.error(`❌ Erro ao inserir ${arquivo}:`, error.message);
            }
            else {
                console.log(`✅ Inserido: ${arquivo}`);
                inseridos++;
            }
        }
        catch (err) {
            console.error(`⚠️ Erro no arquivo ${arquivo}:`, err.message);
        }
    }
    console.log(`🎓 Registro concluído. Inseridos: ${inseridos}, já existentes: ${pulados}`);
}
// ✅ Executa apenas se chamado diretamente via CLI
if (require.main === module) {
    registrarModulosFilosoficos();
}
//# sourceMappingURL=registrarModulosFilosoficos.js.map