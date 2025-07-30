import { supabaseAdmin } from '../lib/supabaseAdmin';
import { loadEmotionStore, saveEmotionStore } from '../utils/emotionMapStore';

// 🎯 Mapeamento de aliases
export const EMOTION_ALIASES: Record<string, string> = {
  alegria: 'feliz',
  alivio: 'calmo',
  angustia: 'angustia',
  ansiedade: 'ansiedade',
  compulsividade: 'irritado',
  confianca: 'confianca',
  conflito: 'conflito',
  confusao: 'confusao',
  desanimo: 'triste',
  desconexao: 'triste',
  desconfiança: 'medo',
  duvida: 'surpresa',
  esperanca: 'feliz',
  exaustao: 'irritado',
  expectativa: 'antecipacao',
  frustracao: 'raiva',
  nervosismo: 'ansiedade',
  nostalgia: 'nostalgia',
  pressao: 'irritado',
  realizacao: 'feliz',
  rejeicao: 'triste',
  satisfacao: 'feliz',
  saudade: 'nostalgia',
  sensacao_de_instabilidade: 'ansiedade',
  coragem: 'coragem'
};

// 🎯 Mapeamento de cores
export const EMOTION_COLORS: Record<string, string> = {
  feliz: '#fcd34d',
  calmo: '#6ee7b7',
  triste: '#60a5fa',
  irritado: '#fda4af',
  medo: '#a78bfa',
  surpresa: '#f97316',
  antecipacao: '#38bdf8',
  raiva: '#f87171',
  outros: '#999999',
  angustia: '#9CA3AF',
  ansiedade: '#C084FC',
  confusao: '#FCD34D',
  confianca: '#34D399',
  conflito: '#F87171',
  nostalgia: '#FBBF24',
  coragem: '#4ADE80'
};

export const DOMINIO_ALIASES: Record<string, string> = {
  saude_mental: 'saude',
  saude_fisica: 'saude',
  bem_estar: 'saude',
  relacionamento_familiar: 'familia',
  familia_e_amigos: 'familia',
  relacoes_familiares: 'familia',
  trabalho_profissional: 'trabalho',
  carreira: 'trabalho'
};

function mapearDominio(raw: string): string {
  const normalizado = normalizarTexto(raw);
  return DOMINIO_ALIASES[normalizado] || normalizado || 'outros';
}

// ✅ Utils
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

function agruparPorFrequencia(lista: string[]): Record<string, number> {
  return lista.reduce((acc, item) => {
    const chave = item.trim().toLowerCase();
    acc[chave] = (acc[chave] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function normalizar(valor: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (valor - min) / (max - min);
}

export async function gerarRelatorioEmocional(userId: string) {
  const emotionStore = await loadEmotionStore();

  const { data: memorias, error } = await supabaseAdmin
    .from('memories')
    .select('emocao_principal, dominio_vida, intensidade, created_at, salvar_memoria, tags')
    .eq('usuario_id', userId)
    .eq('salvar_memoria', true);

  if (error || !memorias) throw new Error('Erro ao buscar memórias.');

  let significativas = memorias.filter(m => m.intensidade && m.intensidade >= 7);

  const agrupadasPorEmocao: Record<string, typeof significativas> = {};
  for (const mem of significativas) {
    const key = normalizarTexto(mem.emocao_principal?.trim() || 'outros');
    if (!agrupadasPorEmocao[key]) agrupadasPorEmocao[key] = [];
    agrupadasPorEmocao[key].push(mem);
  }

  for (const key in agrupadasPorEmocao) {
    agrupadasPorEmocao[key].sort((a, b) => (b.intensidade || 0) - (a.intensidade || 0));
    agrupadasPorEmocao[key] = agrupadasPorEmocao[key].slice(0, 5);
  }

  significativas = Object.values(agrupadasPorEmocao).flat();

  const intensidadePorData: Record<string, Record<string, number>> = {};
  for (const mem of significativas) {
    if (!mem.created_at) continue;
    const data = mem.created_at.slice(0, 10);
    const dominioRaw = mem.dominio_vida?.trim() || 'outros';
    const dominio = mapearDominio(dominioRaw);

    if (!intensidadePorData[data]) intensidadePorData[data] = {};
    if (!intensidadePorData[data][dominio]) intensidadePorData[data][dominio] = 0;
    intensidadePorData[data][dominio] += mem.intensidade ?? 0;
  }

  const linhaDoTempoIntensidadeArray = Object.entries(intensidadePorData)
    .map(([data, dominios]) => ({ data, ...dominios }))
    .filter(item => Object.keys(item).length > 1);

  const emocoes: string[] = [];
  const dominios: string[] = [];
  const tags: string[] = [];
  const pontosEmocionais: { emocao: string, valencia: number, excitacao: number, cor: string }[] = [];
  const jitterAmount = 0.2;

  for (const mem of significativas) {
    if (!mem.emocao_principal || !mem.created_at) continue;

    const emocaoRaw = normalizarTexto(mem.emocao_principal.trim());
    const emocaoBase = EMOTION_ALIASES[emocaoRaw] || emocaoRaw;

    emocoes.push(emocaoBase);

    const dominio = mem.dominio_vida
      ? normalizarTexto(mem.dominio_vida.trim())
      : 'outros';
    dominios.push(dominio);

    if (mem.tags) tags.push(...mem.tags.map((t: string) => normalizarTexto(t))); // ✅ Aqui foi a alteração

    let coords = emotionStore[emocaoBase];
    if (!coords) {
      coords = {
        valencia: (Math.random() * 2 - 1) * 0.7,
        excitacao: (Math.random() * 2 - 1) * 0.7
      };
      emotionStore[emocaoBase] = coords;
    }

    const jitterX = (Math.random() - 0.5) * jitterAmount;
    const jitterY = (Math.random() - 0.5) * jitterAmount;

    pontosEmocionais.push({
      emocao: emocaoBase,
      valencia: coords.valencia + jitterX,
      excitacao: coords.excitacao + jitterY,
      cor: EMOTION_COLORS[emocaoBase] || EMOTION_COLORS.outros
    });
  }

  await saveEmotionStore(emotionStore);

  const valencias = pontosEmocionais.map(p => p.valencia);
  const excitacoes = pontosEmocionais.map(p => p.excitacao);
  const minValencia = Math.min(...valencias);
  const maxValencia = Math.max(...valencias);
  const minExcitacao = Math.min(...excitacoes);
  const maxExcitacao = Math.max(...excitacoes);

  const mapaEmocionalNormalizado = pontosEmocionais.map(p => ({
    emocao: p.emocao,
    valenciaNormalizada: normalizar(p.valencia, minValencia, maxValencia),
    excitacaoNormalizada: normalizar(p.excitacao, minExcitacao, maxExcitacao),
    cor: p.cor
  }));

  const freqEmocoes = agruparPorFrequencia(emocoes);
  const freqDominios = agruparPorFrequencia(dominios);
  const freqTags = agruparPorFrequencia(tags);

  const emocoesDominantes = Object.entries(freqEmocoes)
    .sort((a, b) => b[1] - a[1])
    .map(([emocao, valor]) => ({
      emocao,
      valor,
      cor: EMOTION_COLORS[emocao] || EMOTION_COLORS.outros
    }));

  return {
    emocoes_dominantes: emocoesDominantes,
    linha_do_tempo_intensidade: linhaDoTempoIntensidadeArray,
    mapa_emocional_2d: mapaEmocionalNormalizado,
    dominios_dominantes: Object.entries(freqDominios).map(([dominio, valor]) => ({ dominio, valor })),
    tags_dominantes: Object.entries(freqTags).map(([tag, valor]) => ({ tag, valor })),
    total_memorias: significativas.length
  };
}
