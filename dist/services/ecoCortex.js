"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEcoResponse = getEcoResponse;
// IMPORTS
const axios_1 = __importDefault(require("axios"));
const supabase_js_1 = require("@supabase/supabase-js");
const updateEmotionalProfile_1 = require("./updateEmotionalProfile");
const promptController_1 = require("../controllers/promptController");
const embeddingService_1 = require("./embeddingService");
const respostaSaudacaoAutomatica_1 = require("../utils/respostaSaudacaoAutomatica");
const heuristicaService_1 = require("./heuristicaService");
const referenciasService_1 = require("./referenciasService");
// UTILS
const mapRoleForOpenAI = (role) => {
    if (role === "model")
        return "assistant";
    if (role === "system")
        return "system";
    return "user";
};
const limparResposta = (t) => t.replace(/```json[\s\S]*?```/gi, "")
    .replace(/```[\s\S]*?```/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/###.*?###/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
const formatarTextoEco = (t) => t.replace(/\n{3,}/g, "\n\n")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/(?<!\n)\n(?!\n)/g, "\n\n")
    .replace(/^-\s+/gm, "— ")
    .replace(/^\s+/gm, "")
    .trim();
// LOG HEURÍSTICAS
async function logHeuristicasEmbedding(texto, usuarioId) {
    try {
        const heuristicas = await (0, heuristicaService_1.buscarHeuristicasSemelhantes)(texto, usuarioId);
        if (!heuristicas || heuristicas.length === 0) {
            console.log("🔍 Nenhuma heurística ativada por embedding.");
            return;
        }
        console.log("📊 Heurísticas ativadas por embedding:");
        heuristicas.forEach((h, i) => {
            const nome = h.nome || h.arquivo || `Heurística ${i + 1}`;
            const similaridade = h.similaridade?.toFixed(3) ?? "N/A";
            console.log(`• ${nome} (similaridade: ${similaridade})`);
        });
    }
    catch (err) {
        console.warn("⚠️ Erro ao logar heurísticas:", err.message || err);
    }
}
// BLOCO TÉCNICO
async function gerarBlocoTecnicoSeparado({ mensagemUsuario, respostaIa, apiKey, }) {
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
  "analise_resumo": ""
}

⚠️ NÃO adicione mais nada além deste JSON. Não explique, não comente.`;
        const { data } = await axios_1.default.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "openai/gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 500,
        }, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });
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
            "analise_resumo",
        ];
        const cleanJson = {};
        for (const key of permitido) {
            cleanJson[key] = parsed[key] ?? null;
        }
        console.log("🧠 Bloco técnico extraído e sanitizado:", cleanJson);
        return cleanJson;
    }
    catch (err) {
        console.warn("⚠️ Erro ao gerar bloco técnico:", err.message || err);
        return null;
    }
}
// FUNÇÃO PRINCIPAL
async function getEcoResponse({ messages, userId, userName, accessToken, mems = [], forcarMetodoViva = false, blocoTecnicoForcado = null, }) {
    try {
        if (!Array.isArray(messages) || messages.length === 0)
            throw new Error('Parâmetro "messages" vazio ou inválido.');
        if (!accessToken)
            throw new Error("Token (accessToken) ausente.");
        const respostaInicial = (0, respostaSaudacaoAutomatica_1.respostaSaudacaoAutomatica)({ messages, userName });
        if (respostaInicial)
            return { message: respostaInicial };
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey)
            throw new Error("OPENROUTER_API_KEY não configurada.");
        const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { global: { headers: { Authorization: `Bearer ${accessToken}` } } });
        const ultimaMsg = messages.at(-1)?.content || "";
        if (!forcarMetodoViva) {
            await logHeuristicasEmbedding(ultimaMsg, userId);
        }
        const systemPrompt = await (0, promptController_1.montarContextoEco)({
            userId,
            ultimaMsg,
            userName,
            perfil: null,
            mems,
            forcarMetodoViva,
            blocoTecnicoForcado,
        });
        console.log('==== SYSTEM PROMPT USADO ====');
        console.log(systemPrompt);
        const chatMessages = [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({
                role: mapRoleForOpenAI(m.role),
                content: m.content,
            })),
        ];
        const { data } = await axios_1.default.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "openai/gpt-4o",
            messages: chatMessages,
            temperature: 0.8,
            top_p: 0.95,
            presence_penalty: 0.3,
            frequency_penalty: 0.2,
            max_tokens: 1500,
        }, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
            },
        });
        const raw = data?.choices?.[0]?.message?.content ?? "";
        if (!raw)
            throw new Error("Resposta vazia da IA.");
        const cleaned = formatarTextoEco(limparResposta(raw));
        if (forcarMetodoViva) {
            console.log("✅ Rodada forçada (METODO_VIVA). Pulando salvar no banco.");
            return { message: cleaned };
        }
        const bloco = await gerarBlocoTecnicoSeparado({
            mensagemUsuario: ultimaMsg,
            respostaIa: cleaned,
            apiKey,
        });
        // 🔥 NOVO TRECHO: checa intensidade e força segunda rodada
        if (bloco && bloco.intensidade >= 7) {
            console.log(`⚡ Intensidade alta detectada (${bloco.intensidade}), iniciando segunda rodada METODO_VIVA...`);
            const vivaResponse = await getEcoResponse({
                messages,
                userId,
                userName,
                accessToken,
                mems,
                forcarMetodoViva: true,
                blocoTecnicoForcado: bloco,
            });
            return vivaResponse;
        }
        let intensidade;
        let emocao = "indefinida";
        let tags = [];
        let resumo = cleaned;
        if (bloco) {
            intensidade = Number(bloco.intensidade);
            if (!isNaN(intensidade)) {
                intensidade = Math.round(intensidade);
            }
            else {
                intensidade = undefined;
            }
            emocao = bloco.emocao_principal || "indefinida";
            tags = Array.isArray(bloco.tags) ? bloco.tags : [];
            const nivelNumerico = typeof bloco.nivel_abertura === "number"
                ? Math.round(bloco.nivel_abertura)
                : bloco.nivel_abertura === "baixo"
                    ? 1
                    : bloco.nivel_abertura === "médio"
                        ? 2
                        : bloco.nivel_abertura === "alto"
                            ? 3
                            : null;
            const textoParaEmbedding = [cleaned, bloco.analise_resumo ?? ""].join("\n");
            const embeddingFinal = await (0, embeddingService_1.embedTextoCompleto)(textoParaEmbedding, "memoria ou referencia");
            let referenciaAnteriorId = null;
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
                usuario_id: userId,
                mensagem_id: messages.at(-1)?.id ?? null,
                resumo_eco: bloco.analise_resumo ?? cleaned,
                emocao_principal: emocao,
                intensidade: intensidade ?? 0,
                contexto: ultimaMsg,
                dominio_vida: bloco.dominio_vida ?? null,
                padrao_comportamental: bloco.padrao_comportamental ?? null,
                nivel_abertura: nivelNumerico,
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
                    if (error) {
                        console.warn("⚠️ Erro ao salvar memória:", error.message);
                    }
                    else {
                        console.log(`✅ Memória salva com sucesso para o usuário ${userId}.`);
                        try {
                            console.log(`🔄 Atualizando perfil emocional de ${userId}...`);
                            await (0, updateEmotionalProfile_1.updateEmotionalProfile)(userId);
                            console.log(`🧠 Perfil emocional atualizado com sucesso.`);
                        }
                        catch (err) {
                            console.error("❌ Erro ao atualizar perfil emocional:", err.message || err);
                        }
                    }
                }
                else {
                    await (0, referenciasService_1.salvarReferenciaTemporaria)(payload);
                    console.log(`📎 Referência emocional leve registrada para ${userId}`);
                }
            }
            else {
                console.warn("⚠️ Intensidade não definida ou inválida. Nada será salvo no banco.");
            }
        }
        return { message: cleaned, intensidade, resumo, emocao, tags };
    }
    catch (err) {
        console.error("❌ getEcoResponse error:", err.message || err);
        throw err;
    }
}
//# sourceMappingURL=ecoCortex.js.map