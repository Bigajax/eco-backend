"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackReferenciaEmocional = exports.trackMemoriaRegistrada = exports.trackPerguntaProfunda = exports.trackEcoDemorou = exports.trackMensagemEnviada = void 0;
// server/events/mixpanelEvents.ts
const mixpanel_1 = __importDefault(require("../../lib/mixpanel"));
const trackMensagemEnviada = ({ userId, tempoRespostaMs, tokensUsados, modelo, }) => {
    mixpanel_1.default.track('Mensagem enviada', {
        userId,
        tempoRespostaMs,
        tokensUsados,
        modelo,
    });
};
exports.trackMensagemEnviada = trackMensagemEnviada;
const trackEcoDemorou = ({ userId, duracaoMs, ultimaMsg, }) => {
    mixpanel_1.default.track('Eco demorou', {
        userId,
        duracaoMs,
        ultimaMsg,
    });
};
exports.trackEcoDemorou = trackEcoDemorou;
const trackPerguntaProfunda = ({ userId, emocao, intensidade, categoria, dominioVida, }) => {
    mixpanel_1.default.track('Pergunta profunda feita', {
        userId,
        emocao,
        intensidade,
        categoria,
        dominioVida,
    });
};
exports.trackPerguntaProfunda = trackPerguntaProfunda;
const trackMemoriaRegistrada = ({ userId, intensidade, emocao, categoria, dominioVida, }) => {
    mixpanel_1.default.track('Memória registrada', {
        userId,
        intensidade,
        emocao,
        categoria,
        dominioVida,
    });
};
exports.trackMemoriaRegistrada = trackMemoriaRegistrada;
const trackReferenciaEmocional = ({ userId, intensidade, emocao, tags, categoria, }) => {
    mixpanel_1.default.track('Referência emocional', {
        userId,
        intensidade,
        emocao,
        tags,
        categoria,
    });
};
exports.trackReferenciaEmocional = trackReferenciaEmocional;
//# sourceMappingURL=mixpanelEvents.js.map