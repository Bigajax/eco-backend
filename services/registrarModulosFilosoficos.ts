import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { embedTextoCompleto } from '../services/embeddingService';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Caminho correto da pasta
const pastaModulos = path.join(process.cwd(), 'assets/modulos_filosoficos');

export async function registrarModulosFilosoficos() {
  let arquivos: string[];

  try {
    arquivos = await fs.readdir(pastaModulos);
  } catch (err) {
    console.error('❌ Erro ao ler a pasta de módulos filosóficos:', (err as Error).message);
    return;
  }

  let inseridos = 0;
  let pulados = 0;

  for (const arquivo of arquivos) {
    try {
      const conteudo = await fs.readFile(path.join(pastaModulos, arquivo), 'utf-8');

      const { data: jaExiste } = await supabase
        .from('heuristicas_embeddings')
        .select('id')
        .eq('arquivo', arquivo)
        .eq('tipo', 'filosofico')
        .maybeSingle();

      if (jaExiste) {
        console.log(`🟡 Já registrado: ${arquivo}`);
        pulados++;
        continue;
      }

      const embedding = await embedTextoCompleto(conteudo, `💠 ${arquivo}`);

      const { error } = await supabase.from('heuristicas_embeddings').insert({
        arquivo,
        embedding,
        tags: [], // ← insira tags se quiser
        tipo: 'filosofico'
      });

      if (error) {
        console.error(`❌ Erro ao inserir ${arquivo}:`, error.message);
      } else {
        console.log(`✅ Inserido: ${arquivo}`);
        inseridos++;
      }
    } catch (err: any) {
      console.error(`⚠️ Erro no arquivo ${arquivo}:`, err.message);
    }
  }

  console.log(`🎓 Registro concluído. Inseridos: ${inseridos}, já existentes: ${pulados}`);
}

// ✅ Executa apenas se chamado diretamente via CLI
if (require.main === module) {
  registrarModulosFilosoficos();
}
