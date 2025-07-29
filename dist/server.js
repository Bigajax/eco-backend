"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const promptRoutes_1 = __importDefault(require("./routes/promptRoutes"));
const memoryRoutes_1 = __importDefault(require("./routes/memoryRoutes"));
const perfilEmocionalRoutes_1 = __importDefault(require("./routes/perfilEmocionalRoutes"));
const voiceTTSRoutes_1 = __importDefault(require("./routes/voiceTTSRoutes"));
const voiceFullRoutes_1 = __importDefault(require("./routes/voiceFullRoutes"));
const openrouterRoutes_1 = __importDefault(require("./routes/openrouterRoutes"));
const relatorioEmocionalRoutes_1 = __importDefault(require("./routes/relatorioEmocionalRoutes"));
const registrarTodasHeuristicas_1 = require("./services/registrarTodasHeuristicas");
const registrarModulosFilosoficos_1 = require("./services/registrarModulosFilosoficos");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// 🔐 CORS
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// 📦 Body parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 🧾 Logger
app.use((req, res, next) => {
    console.log(`Backend: [${req.method}] ${req.originalUrl}`);
    next();
});
// ✅ Rotas
app.use('/api', promptRoutes_1.default);
app.use('/api/memorias', memoryRoutes_1.default);
app.use('/api/perfil-emocional', perfilEmocionalRoutes_1.default);
app.use('/api/voice', voiceTTSRoutes_1.default);
app.use('/api/voice', voiceFullRoutes_1.default);
app.use('/api', openrouterRoutes_1.default);
app.use('/api/relatorio-emocional', relatorioEmocionalRoutes_1.default);
// 🚀 Inicialização
app.listen(PORT, async () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
    if (process.env.REGISTRAR_HEURISTICAS === 'true') {
        await (0, registrarTodasHeuristicas_1.registrarTodasHeuristicas)();
        console.log('🎯 Registro de heurísticas finalizado (executado conforme .env)');
    }
    if (process.env.REGISTRAR_FILOSOFICOS === 'true') {
        await (0, registrarModulosFilosoficos_1.registrarModulosFilosoficos)();
        console.log('🧘 Registro de módulos filosóficos finalizado (executado conforme .env)');
    }
});
exports.default = app;
//# sourceMappingURL=server.js.map