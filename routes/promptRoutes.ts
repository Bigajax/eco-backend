// server/routes/promptRoutes.ts

import { Router, Request, Response } from 'express';
import { getPromptEcoPreview } from '../controllers/promptController';



const router = Router();

console.log('Backend: promptRoutes carregado.');

/**
 * GET /api/prompt-preview
 * Retorna o prompt final com base no estado atual (para testes/debug).
 */
router.get(
  '/prompt-preview',
  async (req: Request, res: Response) => {
    try {
      await getPromptEcoPreview(req, res);
    } catch (error) {
      console.error('Erro no handler de rota /prompt-preview:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro interno ao montar o prompt.' });
      }
    }
  }
);

export default router;
