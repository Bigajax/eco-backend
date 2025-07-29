// server/events/mixpanelEvents.ts
import mixpanel from '../../lib/mixpanel';

export const trackMensagemEnviada = ({
  userId,
  tempoRespostaMs,
  tokensUsados,
  modelo,
}: {
  userId?: string;
  tempoRespostaMs?: number;
  tokensUsados?: number;
  modelo?: string;
}) => {
  mixpanel.track('Mensagem enviada', {
    userId,
    tempoRespostaMs,
    tokensUsados,
    modelo,
  });
};

export const trackEcoDemorou = ({
  userId,
  duracaoMs,
  ultimaMsg,
}: {
  userId?: string;
  duracaoMs: number;
  ultimaMsg: string;
}) => {
  mixpanel.track('Eco demorou', {
    userId,
    duracaoMs,
    ultimaMsg,
  });
};

export const trackPerguntaProfunda = ({
  userId,
  emocao,
  intensidade,
  categoria,
  dominioVida,
}: {
  userId?: string;
  emocao: string;
  intensidade?: number;
  categoria?: string | null;
  dominioVida?: string | null;
}) => {
  mixpanel.track('Pergunta profunda feita', {
    userId,
    emocao,
    intensidade,
    categoria,
    dominioVida,
  });
};

export const trackMemoriaRegistrada = ({
  userId,
  intensidade,
  emocao,
  categoria,
  dominioVida,
}: {
  userId?: string;
  intensidade?: number;
  emocao: string;
  categoria?: string | null;
  dominioVida?: string | null;
}) => {
  mixpanel.track('Memória registrada', {
    userId,
    intensidade,
    emocao,
    categoria,
    dominioVida,
  });
};

export const trackReferenciaEmocional = ({
  userId,
  intensidade,
  emocao,
  tags,
  categoria,
}: {
  userId?: string;
  intensidade?: number;
  emocao: string;
  tags: string[];
  categoria?: string | null;
}) => {
  mixpanel.track('Referência emocional', {
    userId,
    intensidade,
    emocao,
    tags,
    categoria,
  });
};
