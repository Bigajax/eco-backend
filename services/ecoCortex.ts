// IMPORTS
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { updateEmotionalProfile } from "./updateEmotionalProfile";
import { montarContextoEco } from "../controllers/promptController";
import { embedTextoCompleto } from "./embeddingService";
import { respostaSaudacaoAutomatica } from "../utils/respostaSaudacaoAutomatica";
import { buscarHeuristicasSemelhantes } from "./heuristicaService";
import { salvarReferenciaTemporaria } from "./referenciasService";
import mixpanel from '../lib/mixpanel';
import {
  trackMensagemEnviada,
  trackMemoriaRegistrada,
  trackReferenciaEmocional,
  trackPerguntaProfunda,
  trackEcoDemorou,
} from '../analytics/events/mixpanelEvents';






// UTILS
const mapRoleForOpenAI = (role: string): "user" | "assistant" | "system" => {
  if (role === "model") return "assistant";
  if (role === "system") return "system";
  return "user";
};

const limparResposta = (t: string) =>
  t.replace(/```json[\s\S]*?```/gi, "")
    .replace(/```[\s\S]*?```/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/###.*?###/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const formatarTextoEco = (t: string) =>
  t.replace(/\n{3,}/g, "\n\n")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/(?<!\n)\n(?!\n)/g, "\n\n")
    .replace(/^-\s+/gm, "— ")
    .replace(/^\s+/gm, "")
    .trim();

// LOG HEURÍSTICAS
async function logHeuristicasEmbedding(texto: string, usuarioId: string) {
  try {
    const heuristicas = await buscarHeuristicasSemelhantes(texto, usuarioId);
    if (!heuristicas || heuristicas.length === 0) {
      console.log("🔍 Nenhuma heurística ativada por embedding.");
      return;
    }
    console.log("📊 Heurísticas ativadas por embedding:");
    heuristicas.forEach((h: any, i: number) => {
      const nome = h.nome || h.arquivo || `Heurística ${i + 1}`;
      const similaridade = h.similaridade?.toFixed(3) ?? "N/A";
      console.log(`• ${nome} (similaridade: ${similaridade})`);
    });
  } catch (err: any) {
    console.warn("⚠️ Erro ao logar heurísticas:", err.message || err);
  }
}

// BLOCO TÉCNICO
async function gerarBlocoTecnicoSeparado({
  mensagemUsuario,
  respostaIa,
  apiKey,
}: {
  mensagemUsuario: string;
  respostaIa: string;
  apiKey: string;
}): Promise<any | null> {
  try {
    const prompt = `
Extraia e retorne em JSON **somente os campos especificados** com base na resposta a seguir.

Resposta da IA:
"""
${respostaIa}
"""

Mensagem original do usuário:
"${mensagemUsuario}"

Retorne neste formato JSON puro:
{
  "emocao_principal": "",
  "intensidade": 0,
  "tags": [],
  "dominio_vida": "",
  "padrao_comportamental": "",
  "nivel_abertura": "baixo" | "médio" | "alto",
  "categoria": "",
  "analise_resumo": ""
}

⚠️ NÃO adicione mais nada além deste JSON. Não explique, não comente.`;

    const { data } = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const rawContent = data?.choices?.[0]?.message?.content ?? "";
    if (!rawContent) {
      console.warn("⚠️ Resposta vazia ao tentar extrair bloco técnico.");
      return null;
    }

    const match = rawContent.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn("⚠️ Nenhum JSON encontrado no bloco técnico.");
      return null;
    }

    const parsed = JSON.parse(match[0]);

    const permitido = [
  "emocao_principal",
  "intensidade",
  "tags",
  "dominio_vida",
  "padrao_comportamental",
  "nivel_abertura",
  "categoria",
  "analise_resumo",
];
    const cleanJson: any = {};
    for (const key of permitido) {
      cleanJson[key] = parsed[key] ?? null;
    }

    console.log("🧠 Bloco técnico extraído e sanitizado:", cleanJson);
    return cleanJson;
  } catch (err: any) {
    console.warn("⚠️ Erro ao gerar bloco técnico:", err.message || err);
    return null;
  }
}
// FUNÇÃO PRINCIPAL
export async function getEcoResponse({
  messages,
  userId,
  userName,
  accessToken,
  mems = [],
  forcarMetodoViva = false,
  blocoTecnicoForcado = null,
}: {
  messages: { id?: string; role: string; content: string }[];
  userId?: string;
  userName?: string;
  accessToken: string;
  mems?: any[];
  forcarMetodoViva?: boolean;
  blocoTecnicoForcado?: any;
}): Promise<{
  message: string;
  intensidade?: number;
  resumo?: string;
  emocao?: string;
  tags?: string[];
  categoria?: string; // ✅ adiciona isso
}> {
  try {
    if (!Array.isArray(messages) || messages.length === 0)
      throw new Error('Parâmetro "messages" vazio ou inválido.');
    if (!accessToken) throw new Error("Token (accessToken) ausente.");

    const respostaInicial = respostaSaudacaoAutomatica({ messages, userName });
    if (respostaInicial) return { message: respostaInicial };

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY não configurada.");

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    );

    const ultimaMsg = messages.at(-1)?.content || "";

    if (!forcarMetodoViva) {
      await logHeuristicasEmbedding(ultimaMsg, userId!);
    }

    const systemPrompt = await montarContextoEco({
      userId,
      ultimaMsg,
      userName,
      perfil: null,
      mems,
      forcarMetodoViva,
      blocoTecnicoForcado,
    });

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: mapRoleForOpenAI(m.role),
        content: m.content,
      })),
    ];
const inicioEco = Date.now();
const { data } = await axios.post(
  "https://openrouter.ai/api/v1/chat/completions",
  {
    model: "openai/gpt-4o",
    messages: chatMessages,
    temperature: 0.8,
    top_p: 0.95,
    presence_penalty: 0.3,
    frequency_penalty: 0.2,
    max_tokens: 1500,
  },
  {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
    },
  }
);
const duracaoEco = Date.now() - inicioEco;
if (duracaoEco > 3000) {
  trackEcoDemorou({
  userId,
  duracaoMs: duracaoEco,
  ultimaMsg,
});

}


    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    if (!raw) throw new Error("Resposta vazia da IA.");
    trackMensagemEnviada({
  userId,
  tempoRespostaMs: typeof data?.created === 'number' && typeof data?.usage?.prompt_tokens === 'number'
  ? data.created - data.usage.prompt_tokens
  : undefined,
  tokensUsados: data?.usage?.total_tokens || null,
  modelo: data?.model || "desconhecido",
});



    const cleaned = formatarTextoEco(limparResposta(raw));

    // ⚠️ Aqui está o conserto: definimos o bloco técnico agora
    const bloco =
  blocoTecnicoForcado ||
  (await gerarBlocoTecnicoSeparado({
    mensagemUsuario: ultimaMsg,
    respostaIa: cleaned,
    apiKey,
  }));

    if (bloco && bloco.intensidade !== undefined) {
  let intensidade: number | undefined;
  let emocao: string = "indefinida";
  let tags: string[] = [];
  let resumo: string | undefined =
  typeof bloco?.analise_resumo === "string" && bloco.analise_resumo.trim().length > 0
    ? bloco.analise_resumo.trim()
    : cleaned;


  intensidade = Number(bloco.intensidade);
  if (!isNaN(intensidade)) {
    intensidade = Math.round(intensidade);
  } else {
    intensidade = undefined;
  }

  emocao = bloco.emocao_principal || "indefinida";
  tags = Array.isArray(bloco.tags) ? bloco.tags : [];

  const nivelNumerico =
    typeof bloco.nivel_abertura === "number"
      ? Math.round(bloco.nivel_abertura)
      : bloco.nivel_abertura === "baixo"
      ? 1
      : bloco.nivel_abertura === "médio"
      ? 2
      : bloco.nivel_abertura === "alto"
      ? 3
      : null;
      if (nivelNumerico === 3) {
  trackPerguntaProfunda({
  userId,
  emocao,
  intensidade,
  categoria: bloco.categoria ?? null,
  dominioVida: bloco.dominio_vida ?? null,
});

}


  const cleanedSafe = typeof cleaned === "string" ? cleaned.trim() : "";
  const analiseResumoSafe =
    typeof bloco?.analise_resumo === "string"
      ? bloco.analise_resumo.trim()
      : "";

  let textoParaEmbedding = [cleanedSafe, analiseResumoSafe]
    .filter((s) => typeof s === "string" && s.trim().length > 0)
    .join("\n")
    .trim();

  if (!textoParaEmbedding || textoParaEmbedding.length < 3) {
    textoParaEmbedding = "PLACEHOLDER EMBEDDING";
  } else {
    textoParaEmbedding = textoParaEmbedding.slice(0, 8000);
  }

  console.log("🧭 Texto final para embed:", textoParaEmbedding);
  const embeddingFinal = await embedTextoCompleto(
    textoParaEmbedding,
    "memoria ou referencia"
  );

  let referenciaAnteriorId: string | null = null;
  if (userId) {
    const { data: ultimaMemoria } = await supabase
      .from("memories")
      .select("id")
      .eq("usuario_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    referenciaAnteriorId = ultimaMemoria?.id ?? null;
  }

  const payload = {
  usuario_id: userId!,
  mensagem_id: messages.at(-1)?.id ?? null,
  resumo_eco: bloco.analise_resumo ?? cleaned,
  emocao_principal: emocao,
  intensidade: intensidade ?? 0,
  contexto: ultimaMsg,
  dominio_vida: bloco.dominio_vida ?? null,
  padrao_comportamental: bloco.padrao_comportamental ?? null,
  nivel_abertura: nivelNumerico,
  categoria: bloco.categoria ?? null,
  analise_resumo: bloco.analise_resumo ?? null,
  tags,
  embedding: embeddingFinal,
  referencia_anterior_id: referenciaAnteriorId,
};


  if (userId && intensidade !== undefined) {
    if (intensidade >= 7) {
      const { error } = await supabase.from("memories").insert([
        {
          ...payload,
          salvar_memoria: true,
          created_at: new Date().toISOString(),
        },
      ]);
      trackMemoriaRegistrada({
  userId,
  intensidade,
  emocao,
  dominioVida: bloco.dominio_vida ?? null,
  categoria: bloco.categoria ?? null,
});


      if (error) {
        console.warn("⚠️ Erro ao salvar memória:", error.message);
      } else {
        console.log(`✅ Memória salva com sucesso para o usuário ${userId}.`);
        try {
          console.log(`🔄 Atualizando perfil emocional de ${userId}...`);
          await updateEmotionalProfile(userId);
          console.log(`🧠 Perfil emocional atualizado com sucesso.`);
        } catch (err: any) {
          console.error(
            "❌ Erro ao atualizar perfil emocional:",
            err.message || err
          );
        }
      }
    } else {
      await salvarReferenciaTemporaria(payload);
      console.log(`📎 Referência emocional leve registrada para ${userId}`);
    }
    trackReferenciaEmocional({
  userId,
  intensidade,
  emocao,
  tags,
  categoria: bloco.categoria ?? null,
});


  } else {
    console.warn(
      "⚠️ Intensidade não definida ou inválida. Nada será salvo no banco."
    );
  }
  const categoria = bloco.categoria ?? null;

return {
  message: cleaned,
  intensidade: bloco?.intensidade ?? undefined,
  resumo: bloco?.analise_resumo ?? cleaned,
  emocao: bloco?.emocao_principal ?? "indefinida",
  tags: bloco?.tags ?? [],
  categoria: bloco?.categoria ?? null,
};

}
console.log("🧩 BLOCO TÉCNICO:", bloco);
// 🟡 Caso não seja rodada forçada e não tenha intensidade relevante, apenas retorne a resposta limpa.
return {
  message: cleaned,
  categoria: bloco ? bloco.categoria ?? null : null,
};
  } catch (err: any) {
    console.error("❌ getEcoResponse error:", err.message || err);
    throw err;
  }
}
