// services/buscarMemorias.ts

import { embedTextoCompleto } from './embeddingService';
import { supabaseAdmin } from '../lib/supabaseAdmin'; // ✅ Caminho e nome corretos

/**
 * Busca memórias semanticamente semelhantes no Supabase
 */
export async function buscarMemoriasSemelhantes(userId: string, entrada: string) {
  if (!entrada || !userId) return [];

  try {
    const queryEmbedding = await embedTextoCompleto(entrada, 'entrada_usuario');

    const { data, error } = await supabaseAdmin.rpc('buscar_memorias_semelhantes', {
      usuario_id: userId,
      query_embedding: queryEmbedding,
      match_threshold: 0.75, // ajuste conforme necessário
      match_count: 6 // limite de memórias
    });

    if (error) {
      console.error('Erro ao buscar memórias semelhantes:', error.message);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('❌ Erro interno ao buscar memórias:', (e as Error).message);
    return [];
  }
}
