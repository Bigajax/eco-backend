import { supabaseAdmin } from '../lib/supabaseAdmin';

export interface EntradaMemoria {
  usuario_id: string;
  resumo_eco: string;
  intensidade: number;
  emocao_principal?: string;
  tags?: string[];
}

export interface MemoriaSalva {
  id?: string;
  created_at?: string;
}

/**
 * Busca a última memória ou referência para um usuário,
 * retornando { id, created_at } se houver, ou null se não houver nada.
 */
export async function buscarUltimaReferenciaOuMemoria(usuario_id: string): Promise<MemoriaSalva | null> {
  try {
    const { data, error } = await supabaseAdmin
      .rpc('buscar_ultima_memoria_ou_referencia', { usuario_id_input: usuario_id })  // ajuste de nome!
      .single();

    if (error) {
      console.warn('⚠️ Erro ao buscar última memória/referência:', error.message);
      return null;
    }

    if (!data) {
      console.log('ℹ️ Nenhuma memória/referência anterior encontrada.');
      return null;
    }

    console.log('✅ Última memória/referência encontrada:', data);
    return data;
  } catch (err) {
    console.error('❌ Erro inesperado em buscarUltimaReferenciaOuMemoria:', (err as Error).message);
    return null;
  }
}

/**
 * Salva uma nova memória encadeada, referenciando a anterior se existir.
 */
export async function salvarMemoriaComEncadeamento(mem: EntradaMemoria): Promise<void> {
  try {
    const anterior = await buscarUltimaReferenciaOuMemoria(mem.usuario_id);

    const payload = {
      usuario_id: mem.usuario_id,
      resumo_eco: mem.resumo_eco,
      intensidade: mem.intensidade,
      emocao_principal: mem.emocao_principal ?? null,
      tags: mem.tags ?? null,
      referencia_anterior_id: anterior?.id ?? null,
      created_at: new Date().toISOString()
    };

    const { error } = await supabaseAdmin.from('memories').insert(payload);

    if (error) {
      console.error('❌ Erro ao salvar memória encadeada:', error.message);
    } else {
      console.log('✅ Memória salva com encadeamento:', payload);
    }
  } catch (err) {
    console.error('❌ Erro inesperado em salvarMemoriaComEncadeamento:', (err as Error).message);
  }
}

/**
 * Salva uma nova referência temporária encadeada, referenciando a anterior se existir.
 */
export async function salvarReferenciaComEncadeamento(mem: EntradaMemoria): Promise<void> {
  try {
    const anterior = await buscarUltimaReferenciaOuMemoria(mem.usuario_id);

    const payload = {
      usuario_id: mem.usuario_id,
      resumo_eco: mem.resumo_eco,
      intensidade: mem.intensidade,
      emocao_principal: mem.emocao_principal ?? null,
      tags: mem.tags ?? null,
      referencia_anterior_id: anterior?.id ?? null,
      created_at: new Date().toISOString()
    };

    const { error } = await supabaseAdmin.from('referencias_temporarias').insert(payload);

    if (error) {
      console.error('❌ Erro ao salvar referência encadeada:', error.message);
    } else {
      console.log('✅ Referência temporária salva com encadeamento:', payload);
    }
  } catch (err) {
    console.error('❌ Erro inesperado em salvarReferenciaComEncadeamento:', (err as Error).message);
  }
}
