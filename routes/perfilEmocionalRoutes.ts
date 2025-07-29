import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { updateEmotionalProfile } from '../services/updateEmotionalProfile';

const router = Router();

// 🔍 GET /api/perfil-emocional/:userId → Retorna o perfil emocional
router.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ success: false, error: 'Parâmetro userId ausente ou inválido.' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('perfis_emocionais')
      .select(`
        id,
        usuario_id,
        resumo_geral_ia,
        emocoes_frequentes,
        temas_recorrentes,
        ultima_interacao_sig
      `)
      .eq('usuario_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[❌ SUPABASE]', error.message);
      return res.status(500).json({ success: false, error: 'Erro ao buscar perfil.' });
    }

    return res.status(200).json({
      success: true,
      perfil: data ?? null,
      message: data ? 'Perfil carregado com sucesso.' : 'Perfil ainda não gerado.',
    });
  } catch (err: any) {
    console.error('[❌ ERRO SERVIDOR]', err.message || err);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao processar a requisição.',
    });
  }
});

// 🔄 POST /api/perfil-emocional/update → Atualiza o perfil emocional
router.post('/update', async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, error: 'Campo userId é obrigatório.' });
  }

  const resultado = await updateEmotionalProfile(userId);
  return res.status(resultado.success ? 200 : 500).json(resultado);
});

export default router;
