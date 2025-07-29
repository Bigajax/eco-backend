import path from 'path';
import fs from 'fs/promises';
import { Request, Response } from 'express';

import { embedTextoCompleto } from '../services/embeddingService';
import { heuristicasTriggerMap, tagsPorHeuristica } from '../assets/config/heuristicasTriggers';
import { filosoficosTriggerMap } from '../assets/config/filosoficosTriggers';
import { estoicosTriggerMap } from '../assets/config/estoicosTriggers';
import { emocionaisTriggerMap, ModuloEmocionalTrigger } from '../assets/config/emocionaisTriggers';
import { heuristicaNivelAbertura } from '../utils/heuristicaNivelAbertura';
import { buscarHeuristicasSemelhantes } from '../services/heuristicaService';
import { buscarHeuristicaPorSimilaridade } from '../services/heuristicaFuzzyService';
import { buscarMemoriasSemelhantes } from '../services/buscarMemorias';
import { buscarReferenciasSemelhantes } from '../services/buscarReferenciasSemelhantes';
import { buscarEncadeamentosPassados } from '../services/buscarEncadeamentos';
import { matrizPromptBase } from './matrizPromptBase';
import { encoding_for_model } from "@dqbd/tiktoken";

const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info';

function shouldLog(level: 'debug' | 'info' | 'warn') {
  if (level === 'debug' && LOG_LEVEL !== 'debug') return false;
  return true;
}
function logInfo(...args: any[]) {
  if (shouldLog('info')) console.log('[ECO]', ...args);
}

function logWarn(...args: any[]) {
  console.warn('[ECO][WARN]', ...args);
}

function logDebug(...args: any[]) {
  if (shouldLog('debug')) console.debug('[ECO][DEBUG]', ...args);
}


// ----------------------------------
// INTERFACES
// ----------------------------------
interface PerfilEmocional {
  emocoes_frequentes?: Record<string, number>;
  temas_recorrentes?: Record<string, number>;
  ultima_interacao_significativa?: string;
  resumo_geral_ia?: string;
}

interface Memoria {
  created_at?: string;
  resumo_eco: string;
  tags?: string[];
  intensidade?: number;
  similaridade?: number;
  score?: number;
  emocao_principal?: string;
  nivel_abertura?: number;    
}


interface Heuristica {
  arquivo: string;
  gatilhos: string[];
}

interface ModuloFilosoficoTrigger {
  arquivo: string;
  gatilhos: string[];
}

// ----------------------------------
// UTILS
// ----------------------------------
function normalizarTexto(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function capitalizarNome(nome?: string): string {
  if (!nome) return '';
  return nome.trim().replace(/\b\w/g, (c) => c.toUpperCase());
}
function nivelAberturaParaNumero(valor: string | number | undefined): number {
  if (typeof valor === 'string') {
    const clean = valor.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    if (clean === 'baixo') return 1;
    if (clean === 'medio') return 2;
    if (clean === 'alto') return 3;
    return 1;
  }
  if (typeof valor === 'number') {
    return valor;
  }
  return 1;
}
function construirStateSummary(perfil: PerfilEmocional | null, nivel: number): string {
  if (!perfil) return '';

  const emocoes = Object.keys(perfil.emocoes_frequentes || {}).join(', ') || 'nenhuma';
  const temas = Object.keys(perfil.temas_recorrentes || {}).join(', ') || 'nenhum';
  const abertura = nivel === 1 ? 'superficial' : nivel === 2 ? 'reflexiva' : 'profunda';
  const resumo = perfil.resumo_geral_ia || 'sem resumo geral registrado';

  return `
🗺️ Estado Emocional Consolidado:
- Emoções frequentes: ${emocoes}
- Temas recorrentes: ${temas}
- Nível de abertura estimado: ${abertura}
- Última interação significativa: ${perfil.ultima_interacao_significativa ?? 'nenhuma'}
- Resumo geral: ${resumo}
`.trim();
}

function construirNarrativaMemorias(mems: Memoria[]): string {
  if (!mems || mems.length === 0) return '';

  const temas = new Set<string>();
  const emocoes = new Set<string>();
  const frases = [];

  for (const m of mems) {
    if (m.tags) m.tags.forEach(t => temas.add(t));
    if (m.emocao_principal) emocoes.add(m.emocao_principal);
    if (m.resumo_eco) frases.push(`"${m.resumo_eco.trim()}"`);
  }

  const temasTxt = [...temas].join(', ') || 'nenhum tema específico';
  const emocoesTxt = [...emocoes].join(', ') || 'nenhuma emoção destacada';
  const frasesTxt = frases.join(' ');

  return `
📜 Narrativa Integrada das Memórias:
Em outros momentos, você trouxe temas como ${temasTxt}, com emoções de ${emocoesTxt}.
Você compartilhou pensamentos como ${frasesTxt}.
Considere como isso pode ressoar com o que sente agora.
`.trim();
}

// ----------------------------------
// MAIN FUNCTION
// ----------------------------------
export async function montarContextoEco({
  perfil,
  ultimaMsg,
  userId,
  userName,
  mems,
  forcarMetodoViva = false,
  blocoTecnicoForcado = null
}: {
  perfil?: PerfilEmocional | null;
  ultimaMsg?: string;
  userId?: string;
  userName?: string;
  mems?: Memoria[];
  forcarMetodoViva?: boolean;
  blocoTecnicoForcado?: any;
}): Promise<string> {

  const assetsDir = path.join(process.cwd(), 'assets');
  const modulosDir = path.join(assetsDir, 'modulos');
  const modCogDir = path.join(assetsDir, 'modulos_cognitivos');
  const modFilosDir = path.join(assetsDir, 'modulos_filosoficos');
  const modEstoicosDir = path.join(modFilosDir, 'estoicos');
  const modEmocDir = path.join(assetsDir, 'modulos_emocionais');

  const forbidden = await fs.readFile(path.join(modulosDir, 'eco_forbidden_patterns.txt'), 'utf-8');

  let contexto = '';
  const entrada = (ultimaMsg || '').trim();
  const entradaSemAcentos = normalizarTexto(entrada);

  // ----------------------------------
  // SAUDAÇÃO ESPECIAL
  // ----------------------------------
  const saudacoesCurtaLista = ['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite'];
  const isSaudacaoCurta = saudacoesCurtaLista.some((saud) =>
    entradaSemAcentos.startsWith(saud)
  );

  if (isSaudacaoCurta) {
    logInfo('Detecção de saudação curta. Aplicando regra de saudação.');
    try {
      let saudacaoConteudo = await fs.readFile(path.join(modulosDir, 'REGRA_SAUDACAO.txt'), 'utf-8');
      if (userName) {
        saudacaoConteudo = saudacaoConteudo.replace(/\[nome\]/gi, capitalizarNome(userName));
      }
      return `📶 Entrada detectada como saudação breve.\n\n[Módulo REGRA_SAUDACAO]\n${saudacaoConteudo.trim()}\n\n[Módulo eco_forbidden_patterns]\n${forbidden.trim()}`;
    } catch (e) {
      logWarn('Falha ao carregar módulo REGRA_SAUDACAO.txt:', (e as Error).message);
      return `⚠️ Erro ao carregar REGRA_SAUDACAO.`;
    }
  }

  // ----------------------------------
  // NÍVEL DE ABERTURA
  // ----------------------------------
  let nivel = heuristicaNivelAbertura(entrada) || 1;
  if (typeof nivel === 'string') {
    if (nivel === 'baixo') nivel = 1;
    else if (nivel === 'médio') nivel = 2;
    else if (nivel === 'alto') nivel = 3;
    else nivel = 1;
  }
  if (nivel < 1 || nivel > 3) {
    logWarn('Nível de abertura ambíguo ou inválido. Aplicando fallback para nível 1.');
    nivel = 1;
  }
  const desc = nivel === 1 ? 'superficial' : nivel === 2 ? 'reflexiva' : 'profunda';
  contexto += `\n📶 Abertura emocional sugerida (heurística): ${desc}`;
  // ----------------------------------
  // PERFIL EMOCIONAL
  // ----------------------------------
  if (perfil) {
  const stateSummary = construirStateSummary(perfil, nivel);
  contexto += `\n\n${stateSummary}`;
}

  // ----------------------------------
  // MEMÓRIAS
  // ----------------------------------
  let memsUsadas = mems;

  if (forcarMetodoViva && blocoTecnicoForcado) {
    logInfo('Ativando modo forçado METODO_VIVA com bloco técnico fornecido.');
    memsUsadas = [{
      resumo_eco: blocoTecnicoForcado.analise_resumo ?? ultimaMsg ?? "",
      intensidade: Number(blocoTecnicoForcado.intensidade ?? 0),
      emocao_principal: blocoTecnicoForcado.emocao_principal ?? "",
      tags: blocoTecnicoForcado.tags ?? [],
    }];
  } else {
    if (nivel === 1) {
      logInfo('Ignorando embeddings/memórias por abertura superficial.');
      memsUsadas = [];
    }
  }

  // ----------------------------------
  // CONVERSÃO de nivel_abertura para número
  // ----------------------------------
  if (memsUsadas && memsUsadas.length > 0) {
    memsUsadas = memsUsadas.map(mem => ({
      ...mem,
      nivel_abertura: nivelAberturaParaNumero(mem.nivel_abertura)
    }));
  }

  // ----------------------------------
  // HEURÍSTICAS DIRETAS E FUZZY
  // ----------------------------------
  let heuristicaAtiva = heuristicasTriggerMap.find((h: Heuristica) =>
    h.gatilhos.some((g) => entradaSemAcentos.includes(normalizarTexto(g)))
  );

  if (entrada && !heuristicaAtiva) {
    const heuristicasFuzzy = await buscarHeuristicaPorSimilaridade(entrada);
    if (heuristicasFuzzy?.length > 0) {
      heuristicaAtiva = heuristicasFuzzy[0];
      if (heuristicaAtiva?.arquivo) {
        logInfo(`Heurística fuzzy ativada: ${heuristicaAtiva.arquivo} (similaridade mais alta)`);
      }
    } else {
      logInfo('Nenhuma heurística fuzzy ativada.');
    }
  }

  if (entrada) {
    const queryEmbedding = await embedTextoCompleto(entrada, "🔍 heuristica");
    if (process.env.NODE_ENV && process.env.NODE_ENV.trim() !== 'production') {
      logDebug("Embedding gerado (sumário):", queryEmbedding.slice(0, 3), "...");
    }
  }

  const heuristicasEmbedding = entrada
    ? await buscarHeuristicasSemelhantes(entrada, userId ?? null)
    : [];

  if (process.env.NODE_ENV && process.env.NODE_ENV.trim() !== 'production') {
    if (heuristicasEmbedding?.length) {
      logInfo(`${heuristicasEmbedding.length} heurística(s) cognitivas embedding encontradas.`);
    } else {
      logInfo('Nenhuma heurística embedding encontrada.');
    }
  }

  const modulosFilosoficosAtivos = filosoficosTriggerMap.filter((f) =>
    f?.arquivo && f?.arquivo.trim() && f.gatilhos.some((g) =>
      entradaSemAcentos.includes(normalizarTexto(g))
    )
  );

  const modulosEstoicosAtivos = estoicosTriggerMap.filter((e) =>
    e?.arquivo && e?.arquivo.trim() && e.gatilhos.every((g) =>
      entradaSemAcentos.includes(normalizarTexto(g))
    )
  );

  const tagsAlvo = heuristicaAtiva ? tagsPorHeuristica[heuristicaAtiva.arquivo] ?? [] : [];
  if (nivel > 1 && (!memsUsadas?.length) && entrada && userId) {
    try {
      let MIN_SIMILARIDADE = 0.55;
      const consultaParaLembranca = /lembr|record|memória|memorias|memoria|recorda/i.test(entrada);
      if (consultaParaLembranca) {
        logInfo("Detecção de pergunta sobre lembrança: reduzindo threshold.");
        MIN_SIMILARIDADE = 0.3;
      }

      const [memorias, referencias] = await Promise.all([
        buscarMemoriasSemelhantes(userId, entrada),
        buscarReferenciasSemelhantes(userId, entrada)
      ]);

      const memoriasFiltradas = (memorias || []).filter(
        (m: Memoria) => (m.similaridade ?? 0) >= MIN_SIMILARIDADE
      );
      const referenciasFiltradas = (referencias || []).filter(
        (r: Memoria) => (r.similaridade ?? 0) >= MIN_SIMILARIDADE
      );

      memsUsadas = [...memoriasFiltradas, ...referenciasFiltradas];

      const memoriaIntensa = memsUsadas.find(m => (m.intensidade ?? 0) >= 7 && (m.similaridade ?? 0) >= MIN_SIMILARIDADE);
      if (memoriaIntensa) {
        logInfo("Ajuste minimalista: usando memória intensa recuperada sem clonar entrada.");
        memsUsadas = [memoriaIntensa, ...memsUsadas.filter(m => m !== memoriaIntensa)];
      }

      if (process.env.NODE_ENV && process.env.NODE_ENV.trim() !== 'production') {
        if (memsUsadas?.length) {
          logDebug(`Memórias finais:`, memsUsadas);
          memsUsadas.forEach((m, idx) => {
            logDebug(`• [${idx + 1}] "${m.resumo_eco.slice(0, 30)}..." | Intensidade: ${m.intensidade} | Similaridade: ${m.similaridade}`);
          });
        } else {
          logDebug('ℹ️ Nenhuma memória usada no contexto.');
        }
      }

      if (tagsAlvo.length) {
        memsUsadas = memsUsadas.filter((m) =>
          m.tags?.some((t) => tagsAlvo.includes(t))
        );
      }

    } catch (e) {
      logWarn("Erro ao buscar memórias/referências:", (e as Error).message);
      memsUsadas = [];
    }
  }

  if (entrada && perfil && nivel > 1) {
    const memoriaAtual: Memoria = {
      resumo_eco: entrada,
      tags: perfil.temas_recorrentes ? Object.keys(perfil.temas_recorrentes) : [],
      intensidade: 0,
      emocao_principal: Object.keys(perfil.emocoes_frequentes || {})[0] || ''
    };
    memsUsadas = [memoriaAtual, ...(memsUsadas || [])];
  }

  let encadeamentos: Memoria[] = [];
  if (entrada && userId && nivel > 1) {
    try {
      encadeamentos = await buscarEncadeamentosPassados(userId, entrada);
      if (encadeamentos?.length) encadeamentos = encadeamentos.slice(0, 3);
    } catch (e) {
      logWarn("Erro ao buscar encadeamentos:", (e as Error).message);
    }
  }
  // ----------------------------------
  // INSERÇÃO DE MÓDULOS
  // ----------------------------------
  const modulosAdic: string[] = [];
  const modulosInseridos = new Set<string>();

  const inserirModuloUnico = async (arquivo: string | undefined, tipo: string) => {
  logDebug(`Inserindo módulo`, { tipo, arquivo });

  if (!arquivo || !arquivo.trim()) {
    logWarn(`Ignorando chamada para inserirModuloUnico com arquivo inválido: "${arquivo}" (tipo: ${tipo})`);
    return;
  }

  if (modulosInseridos.has(arquivo)) {
    logInfo(`Módulo já inserido anteriormente: ${arquivo}`);
    return;
  }

  const pastasPossiveis = [
    modEmocDir,
    modEstoicosDir,
    modFilosDir,
    modCogDir,
    modulosDir
  ];

  let encontrado = false;

  for (const base of pastasPossiveis) {
    try {
      const caminho = path.join(base, arquivo);
      const conteudo = await fs.readFile(caminho, 'utf-8');
      modulosAdic.push(`\n\n[Módulo ${tipo} → ${arquivo}]\n${conteudo.trim()}`);
      modulosInseridos.add(arquivo);
      logInfo(`Módulo carregado: ${caminho}`);
      encontrado = true;
      break;
    } catch {
      // Tenta na próxima pasta
    }
  }

  if (!encontrado) {
    logWarn(`Falha ao carregar módulo ${arquivo}: não encontrado em nenhuma pasta`);
  }
};


  // ----------------------------------
  // Always Include
  // ----------------------------------
  for (const arquivo of matrizPromptBase.alwaysInclude ?? []) {
    await inserirModuloUnico(arquivo, 'Base');
  }

  // ----------------------------------
// Prompts por Nível
// ----------------------------------
const nivelPrompts = (matrizPromptBase.byNivel[nivel as 2 | 3] ?? [])
  .filter((arquivo: string) => {
    if (!arquivo || !arquivo.trim()) {
      logWarn(`Ignorando arquivo vazio ou inválido na matrizPromptBase.byNivel: "${arquivo}"`);
      return false;
    }

    const intensidadeMin = matrizPromptBase.intensidadeMinima?.[arquivo];
    if (typeof intensidadeMin === 'number') {
      const temIntensa = memsUsadas?.some(mem => (mem.intensidade ?? 0) >= intensidadeMin);
      if (!temIntensa) {
        logInfo(`Ignorando ${arquivo} por intensidade < ${intensidadeMin}`);
        return false;
      }
    }

    const condicao = matrizPromptBase.condicoesEspeciais?.[arquivo];
    if (condicao) {
      const intensidade = memsUsadas && memsUsadas.length > 0
        ? memsUsadas[0].intensidade ?? 0
        : 0;
      const nivelAbertura = nivel;

      const regraAvaliavel = condicao.regra
        .replace(/intensidade/g, intensidade.toString())
        .replace(/nivel/g, nivelAbertura.toString());

      let ativa = false;
      try {
        ativa = eval(regraAvaliavel);
      } catch (e) {
        logWarn(`Erro ao avaliar regra`, { arquivo, regraAvaliavel, erro: (e as Error).message });
        return false;
      }

      logDebug(
  `Avaliando condição para ${arquivo}:`,
  `regra='${condicao.regra}'`,
  `-> intensidade=${intensidade}, nivel=${nivelAbertura}`,
  `-> resultado=${ativa}`
);


      if (!ativa) {
        logInfo(`Ignorando ${arquivo} por condição não satisfeita: ${condicao.descricao}`);
        return false;
      }
    }

    return true;
  });
 // ---- Novo debug simplificado ----
const nivelDescricao = nivel === 1 ? 'superficial' : nivel === 2 ? 'reflexivo' : 'profundo';
logInfo(`Nível de abertura: ${nivelDescricao} (${nivel})`);


const modulosUsados = modulosAdic
  .map((m) => {
    const match = m.match(/\[Módulo.*→ (.*?)\]/);
    return match ? match[1] : null;
  })
  .filter(Boolean);

logInfo(`Módulos incluídos (${modulosUsados.length}):`, modulosUsados);


if (memsUsadas && memsUsadas.length > 0) {
  const memsResumo = memsUsadas.map((m, i) => {
    const texto = typeof m.resumo_eco === 'string' ? m.resumo_eco : '(sem resumo)';
    return {
      idx: i + 1,
      resumo: texto.slice(0, 50).replace(/\n/g, ' ') + (texto.length > 50 ? '...' : ''),
      intensidade: m.intensidade
    };
  });
  logInfo(`Memórias usadas (${memsResumo.length}):`, memsResumo);
}


  // ----------------------------------
  // Heurísticas Cognitivas
  // ----------------------------------
  if (heuristicaAtiva?.arquivo) {
    await inserirModuloUnico(heuristicaAtiva.arquivo, 'Cognitivo');
  }
  for (const h of heuristicasEmbedding ?? []) {
    if (h?.arquivo) await inserirModuloUnico(h.arquivo, 'Cognitivo');
  }

  // ----------------------------------
  // Filosóficos e Estoicos
  // ----------------------------------
  for (const mf of modulosFilosoficosAtivos ?? []) {
    if (mf?.arquivo) await inserirModuloUnico(mf.arquivo, 'Filosófico');
  }

  for (const es of modulosEstoicosAtivos ?? []) {
    if (es?.arquivo) await inserirModuloUnico(es.arquivo, 'Estoico');
  }

  // ----------------------------------
  // Emocionais
  // ----------------------------------
  const modulosEmocionaisAtivos = emocionaisTriggerMap.filter((m: ModuloEmocionalTrigger) => {
    if (!m?.arquivo) return false;

    let intensidadeOk = true;
    const minInt = m.intensidadeMinima;
    if (typeof minInt === 'number') {
      intensidadeOk = memsUsadas?.some((mem) => (mem.intensidade ?? 0) >= minInt) ?? false;
    }

    const tagsPresentes = memsUsadas?.flatMap(mem => mem.tags ?? []) ?? [];
    const emocoesPrincipais = memsUsadas?.map(mem => mem.emocao_principal).filter(Boolean) ?? [];

    return intensidadeOk && (
      m.tags?.some(tag => tagsPresentes.includes(tag)) ||
      m.tags?.some(tag => emocoesPrincipais.includes(tag))
    );
  });

  for (const me of modulosEmocionaisAtivos ?? []) {
  if (me?.arquivo) {
    await inserirModuloUnico(me.arquivo, 'Emocional');
  }

  if (me?.relacionado?.length) {
    for (const rel of me.relacionado) {
      let carregado = false;

      try {
        await inserirModuloUnico(rel, 'Relacionado');
        carregado = true;
      } catch (e) {
        logWarn(`Não encontrado em modulos_emocionais: ${rel}`);
      }

      if (!carregado) {
        try {
          await inserirModuloUnico(rel, 'Relacionado');
          carregado = true;
        } catch (e) {
          logWarn(`Não encontrado em modulos_filosoficos/estoicos: ${rel}`);
        }
      }

      if (!carregado) {
        try {
          await inserirModuloUnico(rel, 'Relacionado');
          logInfo(`Fallback bem-sucedido em modulos_filosoficos para: ${rel}`);
        } catch (e) {
          logWarn(`Falha ao carregar módulo relacionado em qualquer pasta: ${rel}`);

        }
      }
    }
  }
}

  // ----------------------------------
  // INSERÇÃO DE MEMÓRIAS E REFERÊNCIAS NO CONTEXTO
  // ----------------------------------
  if (memsUsadas && memsUsadas.length > 0 && nivel > 1) {
  const narrativa = construirNarrativaMemorias(memsUsadas);
  contexto += `\n\n${narrativa}`;
}

  if (encadeamentos && encadeamentos.length > 0) {
    const encadeamentoTextos = encadeamentos
      .filter(e => e?.resumo_eco?.trim())
      .map(e => `• Encadeamento narrativo anterior: "${e.resumo_eco.trim()}"`)
      .join('\n')
      .trim();

    if (encadeamentoTextos) {
      contexto += `\n\n📝 Resgatando encadeamentos narrativos relacionados para manter coerência e continuidade:\n${encadeamentoTextos}`;
    }
  }

  // ----------------------------------
  // CRITÉRIOS E INSTRUÇÃO FINAL
  // ----------------------------------
  const criterios = await fs.readFile(path.join(modulosDir, 'eco_json_trigger_criteria.txt'), 'utf-8');
  modulosAdic.push(`\n\n[Módulo: eco_json_trigger_criteria]\n${criterios.trim()}`);
  modulosAdic.push(`\n\n[Módulo: eco_forbidden_patterns]\n${forbidden.trim()}`);

  try {
    const memoriaInstrucoes = await fs.readFile(path.join(modulosDir, 'MEMORIAS_NO_CONTEXTO.txt'), 'utf-8');
    modulosAdic.push(`\n\n[Módulo: MEMORIAS_NO_CONTEXTO]\n${memoriaInstrucoes.trim()}`);
  } catch (e) {
    logWarn('Falha ao carregar MEMORIAS_NO_CONTEXTO.txt:', (e as Error).message);
  }

  const instrucoesFinais = `
⚠️ INSTRUÇÃO AO MODELO:
- Use as memórias e o estado emocional consolidado como parte do seu raciocínio.
- Conecte os temas e emoções anteriores ao que o usuário traz agora.
- Ajuste a profundidade e o tom conforme o nível de abertura (superficial, reflexiva, profunda).
- Respeite o ritmo e a autonomia do usuário.
- Evite soluções prontas e interpretações rígidas.
- Estruture sua resposta conforme ECO_ESTRUTURA_DE_RESPOSTA.txt, usando as seções numeradas.
- Se notar padrões, convide à consciência, mas não diagnostique.
`.trim();

modulosAdic.push(`\n\n${instrucoesFinais}`);


// ----------------------------------
// MONTAGEM FINAL
// ----------------------------------
let promptFinal = `${contexto.trim()}\n${modulosAdic.join('\n')}`.trim();

try {
  const enc = await encoding_for_model("gpt-4");
  let tokens = enc.encode(promptFinal);
  const numTokens = tokens.length;
  logInfo(`Tokens estimados: ~${numTokens}`);

  const MAX_PROMPT_TOKENS = 8000;

  if (numTokens > MAX_PROMPT_TOKENS) {
    logWarn(`Prompt acima do limite (${MAX_PROMPT_TOKENS} tokens). Aplicando corte.`);
    tokens = tokens.slice(0, MAX_PROMPT_TOKENS - 100);
    promptFinal = new TextDecoder().decode(enc.decode(tokens));

  }

  enc.free();
} catch (error) {
  logWarn(`Falha ao cortar tokens:`, (error as Error).message);
}

// ✅ FECHAMENTO DA FUNÇÃO PRINCIPAL
return promptFinal;
}

// ----------------------------------
// EXPRESS HANDLER
// ----------------------------------
export const getPromptEcoPreview = async (_req: Request, res: Response) => {
  try {
    const promptFinal = await montarContextoEco({});
    res.json({ prompt: promptFinal });
  } catch (err) {
    logWarn('❌ Erro ao montar prompt:', err);
    res.status(500).json({ error: 'Erro ao montar o prompt' });
  }
};
