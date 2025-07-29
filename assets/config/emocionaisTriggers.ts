export interface ModuloEmocionalTrigger {
  arquivo: string;
  gatilhos: string[];
  relacionado?: string[];
  tags?: string[];
  intensidadeMinima?: number;
}

export const emocionaisTriggerMap: ModuloEmocionalTrigger[] = [
  {
    arquivo: "eco_vulnerabilidade_mitos.txt",
    gatilhos: [
      "me sinto fraco por demonstrar emoções",
      "mostrar o que sinto é perigoso",
      "não posso me abrir com ninguém",
      "parece fraqueza sentir demais",
      "preciso me proteger emocionalmente",
      "não quero parecer vulnerável",
      "é perigoso se abrir emocionalmente"
    ],
    relacionado: [
      "eco_identificacao_mente.txt",
      "eco_corpo_emocao.txt",
      "eco_heuristica_disponibilidade_emocao_risco.txt"
    ],
    tags: [
      "vulnerabilidade",
      "medo",
      "autoprotecao",
      "coragem",
      "insegurança"
    ],
    intensidadeMinima: 5
  },
  {
    arquivo: "eco_emo_vergonha_combate.txt",
    gatilhos: [
      "sou um fracasso",
      "sou uma decepção",
      "me sinto indigno",
      "não sou bom o bastante",
      "ninguém me aceitaria se soubesse",
      "tenho vergonha de quem eu sou",
      "tenho medo de ser julgado",
      "me sinto errado",
      "sinto que sou um erro",
      "não quero que descubram isso sobre mim",
      "odeio parecer fraco",
      "tento esconder meus erros",
      "fingir que não me importo",
      "me justifico quando erro",
      "me defendo para não parecer vulnerável"
    ],
    relacionado: [
      "eco_identificacao_mente.txt",
      "eco_corpo_emocao.txt"
    ],
    tags: [
      "vergonha",
      "vulnerabilidade",
      "autocrítica",
      "inadequação",
      "rejeição",
      "autoimagem",
      "defesa emocional",
      "aparência",
      "insegurança",
      "culpa"
    ],
    intensidadeMinima: 6
  },
  {
    arquivo: "eco_vulnerabilidade_defesas.txt",
    gatilhos: [
      "não posso me permitir sentir",
      "tenho que parecer forte o tempo todo",
      "não gosto de depender dos outros",
      "evito demonstrar quando estou mal",
      "não quero que saibam o que estou sentindo",
      "me sinto fraco quando choro",
      "prefiro lidar com tudo sozinho",
      "é perigoso se abrir com alguém",
      "me protejo escondendo o que sinto",
      "não posso baixar a guarda",
      "me sinto exposto quando mostro fragilidade",
      "fico na defensiva quando me sinto ameaçado",
      "evito pensar no que me machuca",
      "não gosto de parecer vulnerável",
      "me sinto desconfortável quando alguém se aproxima demais"
    ],
    relacionado: [
      "eco_identificacao_mente.txt",
      "eco_corpo_emocao.txt",
      "eco_heuristica_disponibilidade_emocao_risco.txt"
    ],
    tags: [
      "vulnerabilidade",
      "defesa emocional",
      "autojustificação",
      "autodepreciação",
      "autocrítica",
      "evitação",
      "medo de julgamento",
      "esconder emoções",
      "controle emocional",
      "rigidez",
      "autoprotecao",
      "isolamento",
      "desconexão",
      "perfeccionismo",
      "insegurança"
    ],
    intensidadeMinima: 5
  }
];
