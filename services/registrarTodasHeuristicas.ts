// services/registrarTodasHeuristicas.ts

import fs from 'fs/promises';
import path from 'path';
import { embedTextoCompleto } from './embeddingService';
import { supabaseAdmin } from '../lib/supabaseAdmin';

// 🔧 Caminho corrigido
const heuristicasDir = path.join(__dirname, '../assets/modulos_cognitivos');

export async function registrarTodasHeuristicas() {
  try {
    const arquivos = await fs.readdir(heuristicasDir);

    for (const arquivo of arquivos) {
      const caminho = path.join(heuristicasDir, arquivo);
      const conteudo = await fs.readFile(caminho, 'utf-8');

      // ⚠️ Checar se já está registrado
      const { data: existente, error: buscaErro } = await supabaseAdmin
        .from('heuristicas_embeddings')
        .select('id')
        .eq('arquivo', arquivo)
        .single();

      if (existente) {
        console.log(`📌 ${arquivo} já está registrado — pulando.`);
        continue;
      }

      if (buscaErro && buscaErro.code !== 'PGRST116') {
        console.error(`Erro ao verificar duplicidade de ${arquivo}:`, buscaErro.message);
        continue;
      }

      const embedding = await embedTextoCompleto(conteudo, '🔍 heuristica');

      const { error: insercaoErro } = await supabaseAdmin
        .from('heuristicas_embeddings')
        .insert([{
          arquivo,
          embedding,
          tags: [], // ajuste se desejar
          tipo: 'cognitiva'
        }]);

      if (insercaoErro) {
        console.error(`❌ Falha ao inserir ${arquivo}:`, insercaoErro.message);
      } else {
        console.log(`✅ Heurística registrada: ${arquivo}`);
      }
    }
  } catch (err) {
    console.error('❌ Erro ao registrar heurísticas:', (err as Error).message);
  }
}
