import express from 'express';
import { relatorioEmocionalHandler } from '../controllers/relatorioEmocionalController';

const router = express.Router();

router.get('/relatorio-emocional', relatorioEmocionalHandler);

export default router;
