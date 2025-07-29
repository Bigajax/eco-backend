import { supabaseAdmin } from '../lib/supabaseAdmin';
import { embedTextoCompleto } from './embeddingService';

interface ReferenciaTemporaria {
  resumo_eco: string;
  tags?: string[];
  emocao_principal?: string;
  intensidade?: number;
  similaridade: number;
  created_at?: string; 
}

export async function buscarReferenciasSemelhantes(
  userId: string,
  entrada: string
): Promise<ReferenciaTemporaria[]> {
  try {
    if (!entrada?.trim()) return [];

    const vetorConsulta = await embedTextoCompleto(entrada, 'referencia');

    if (!vetorConsulta || !Array.isArray(vetorConsulta)) {
      console.error('❌ Vetor de embedding inválido.');
      return [];
    }

    const { data, error } = await supabaseAdmin.rpc('buscar_referencias_similares', {
      usuario_id: userId,
      query_embedding: vetorConsulta,
      match_threshold: 0.75,
      match_count: 5
    });

    if (error) {
      console.error('❌ Erro ao buscar referências similares via RPC:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Erro inesperado ao buscar referências semelhantes:', (err as Error).message);
    return [];
  }
}
