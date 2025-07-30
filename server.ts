import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import promptRoutes from './routes/promptRoutes';
import memoryRoutes from './routes/memoryRoutes';
import profileRoutes from './routes/perfilEmocionalRoutes';
import voiceTTSRoutes from './routes/voiceTTSRoutes';
import voiceFullRoutes from './routes/voiceFullRoutes';
import openrouterRoutes from './routes/openrouterRoutes';
import relatorioRoutes from './routes/relatorioEmocionalRoutes';

import { registrarTodasHeuristicas } from './services/registrarTodasHeuristicas';
import { registrarModulosFilosoficos } from './services/registrarModulosFilosoficos';

const app = express();
const PORT = process.env.PORT || 3001;

// 🔐 CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || '',            // Produção (Vercel)
    'http://localhost:5173'                    // Desenvolvimento local
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 📦 Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🧾 Logger
app.use((req, res, next) => {
  console.log(`Backend: [${req.method}] ${req.originalUrl}`);
  next();
});

// ✅ Rotas
app.use('/api', promptRoutes);
app.use('/api/memorias', memoryRoutes);
app.use('/api/perfil-emocional', profileRoutes);
app.use('/api/voice', voiceTTSRoutes);
app.use('/api/voice', voiceFullRoutes);
app.use('/api', openrouterRoutes);
app.use('/api/relatorio-emocional', relatorioRoutes);

// 🚀 Inicialização
app.listen(PORT, async () => {
  console.log(`Servidor Express rodando na porta ${PORT}`);

  if (process.env.REGISTRAR_HEURISTICAS === 'true') {
    await registrarTodasHeuristicas();
    console.log('🎯 Registro de heurísticas finalizado (executado conforme .env)');
  }

  if (process.env.REGISTRAR_FILOSOFICOS === 'true') {
    await registrarModulosFilosoficos();
    console.log('🧘 Registro de módulos filosóficos finalizado (executado conforme .env)');
  }
});

export default app;
