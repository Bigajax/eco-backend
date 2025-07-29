import express from 'express';
import { gerarRelatorioEmocional } from '../utils/relatorioEmocionalUtils';

const router = express.Router();

router.get('/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const relatorio = await gerarRelatorioEmocional(usuario_id);

    res.json({ perfil: relatorio }); // ✅ Corrigido aqui
  } catch (err: any) {
    console.error('❌ Erro ao gerar relatório emocional:', err.message || err);
    res.status(500).json({ error: 'Erro ao gerar relatório emocional' });
  }
});

export default router;
