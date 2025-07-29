import { supabase } from "../../lib/supabaseAdmin";
import { embedTextoCompleto } from "../../services/embeddingService";

export async function buscarHeuristicasSemelhantes(texto: string) {
  const query_embedding = await embedTextoCompleto(texto, "🔍 heuristica");
  const vetorSQL = `[${query_embedding.join(',')}]`;

  const { data, error } = await supabase.rpc("buscar_heuristica_semelhante", {
    query_embedding: vetorSQL,
    match_threshold: 0.80,
    match_count: 3
  });

  if (error) {
    console.error("❌ Erro ao buscar heurísticas semelhantes:", error);
    return [];
  }

  return data;
}
