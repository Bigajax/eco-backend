import { supabaseAdmin } from '../lib/supabaseAdmin';

export interface BlocoTecnico {
  usuario_id: string;
  mensagem_id?: string | null;
  referencia_anterior_id?: string | null; // ✅ adicionado
  resumo_eco: string;
  emocao_principal: string;
  intensidade: number;
  contexto: string;
  dominio_vida?: string | null;
  padrao_comportamental?: string | null;
  nivel_abertura?: number | null;
  analise_resumo?: string | null;
  categoria?: string | null;
  tags?: string[] | null;
  embedding: number[];
}

export async function salvarReferenciaTemporaria(bloco: BlocoTecnico) {
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

  const { data, error } = await supabaseAdmin
    .from('referencias_temporarias')
    .insert([payload]);

  if (error) {
    console.error('Erro ao salvar referência temporária:', error.message);
    throw error;
  }

  return data;
}
