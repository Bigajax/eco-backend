// utils/respostaSaudacaoAutomatica.ts
const saudacoesSimples = ['oi', 'olá', 'oie', 'e aí', 'tudo bem?', 'bom dia', 'boa tarde', 'boa noite'];
const encerramentos = ['tchau', 'até mais', 'valeu', 'obrigado', 'até logo', 'bom descanso', 'boa noite', 'durma bem'];

function normalizar(msg: string): string {
  return msg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function getSaudacaoHorario(): { saudacao: string; energia: string } {
  const hora = new Date().getHours();
  if (hora < 6) return { saudacao: "Boa noite", energia: "silenciosa" };
  if (hora < 12) return { saudacao: "Bom dia", energia: "desperta" };
  if (hora < 18) return { saudacao: "Boa tarde", energia: "atenta" };
  return { saudacao: "Boa noite", energia: "recolhida" };
}

export function respostaSaudacaoAutomatica({
  messages,
  userName
}: {
  messages: { content: string }[];
  userName?: string;
}): string | null {
  const ultima = normalizar(messages.at(-1)?.content || '');
  const apenasSaudacao = saudacoesSimples.includes(ultima);
  const despedida = encerramentos.includes(ultima);
  const { saudacao, energia } = getSaudacaoHorario();

  // Abertura – primeira mensagem é uma saudação
  if (messages.length === 1 && apenasSaudacao) {
    return `${saudacao}, ${userName ?? '...'}.\n\nQuer só chegar com calma, ou algo aí dentro já quer se abrir um pouco?\n\nSe quiser só estar aqui, também estou.`;
  }

  // Saudação repetida – já houve conversa antes
  if (messages.length > 1 && apenasSaudacao) {
    return `Oi de novo, ${userName ?? ''}. Às vezes só voltar já muda algo.`;
  }

  // Despedida – resposta com conclusão suave
  if (despedida) {
    return `Que essa ${saudacao.toLowerCase()} te envolva com leveza.\n\nEstarei por aqui quando quiser continuar.`;
  }

  return null;
}
