import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Principal (nome padrão novo)
export async function gerarEmbeddingOpenAI(texto: any, origem?: string): Promise<number[]> {
  try {
    // ✅ Conversão robusta para string
    let textoConvertido: string;

    if (typeof texto === "string") {
      textoConvertido = texto.trim();
    } else if (texto != null && typeof texto.toString === "function") {
      textoConvertido = texto.toString().trim();
    } else {
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
  } catch (error: any) {
    console.error(`🚨 Erro ao gerar embedding${origem ? ` [${origem}]` : ""}:`, error.message || error);
    throw error;
  }
}

// Alias para compatibilidade com outros arquivos que ainda usam o nome antigo
export const embedTextoCompleto = gerarEmbeddingOpenAI;
