"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embedTextoCompleto = void 0;
exports.gerarEmbeddingOpenAI = gerarEmbeddingOpenAI;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
// Principal (nome padrão novo)
async function gerarEmbeddingOpenAI(texto, origem) {
    try {
        // ✅ Conversão robusta para string
        let textoConvertido;
        if (typeof texto === "string") {
            textoConvertido = texto.trim();
        }
        else if (texto != null && typeof texto.toString === "function") {
            textoConvertido = texto.toString().trim();
        }
        else {
            textoConvertido = "";
        }
        // ✅ Fallback garantido se ainda for vazio
        if (!textoConvertido || textoConvertido.length < 3) {
            console.warn(`⚠️ Texto para embedding vazio ou inválido${origem ? ` [${origem}]` : ""}. Usando fallback seguro.`);
            textoConvertido = "PLACEHOLDER EMBEDDING";
        }
        // ✅ Limita tamanho para evitar erro de comprimento
        const textoParaEmbedding = textoConvertido.slice(0, 8000);
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: textoParaEmbedding
        });
        const embedding = response.data?.[0]?.embedding;
        if (!embedding) {
            console.error(`❌ Nenhum embedding retornado pela API da OpenAI.${origem ? ` [${origem}]` : ""}`);
            throw new Error("Embedding não gerado.");
        }
        console.log(`📡 Embedding gerado com sucesso${origem ? ` [${origem}]` : ""}.`);
        return embedding;
    }
    catch (error) {
        console.error(`🚨 Erro ao gerar embedding${origem ? ` [${origem}]` : ""}:`, error.message || error);
        throw error;
    }
}
// Alias para compatibilidade com outros arquivos que ainda usam o nome antigo
exports.embedTextoCompleto = gerarEmbeddingOpenAI;
//# sourceMappingURL=embeddingService.js.map