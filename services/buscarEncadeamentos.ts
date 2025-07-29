// server/services/buscarEncadeamentos.ts

import { createClient } from '@supabase/supabase-js';
import { embedTextoCompleto } from './embeddingService';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function buscarEncadeamentosPassados(userId: string, entrada: string) {
  try {
    const queryEmbedding = await embedTextoCompleto(entrada, '🔗 encadeamento');

    const { data, error } = await supabase.rpc('buscar_encadeamentos_semelhantes', {
      entrada_embedding: queryEmbedding,
      id_usuario: userId
    });

    if (error) {
      console.error('Erro ao buscar encadeamentos via RPC:', error.message);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('Erro inesperado em buscarEncadeamentosPassados:', (e as Error).message);
    return [];
  }
}
