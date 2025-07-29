export interface ModuloEstoicoTrigger {
  arquivo: string;
  gatilhos: string[];
}

export const estoicosTriggerMap: ModuloEstoicoTrigger[] = [
  {
    arquivo: "eco_presenca_racional.txt",
    gatilhos: [
      // Emoções relacionadas à perda de controle
      "estou me sentindo irritado",
      "fico frustrado com coisas que não controlo",
      "fico ansioso com o que não posso mudar",
      "me sinto perdido tentando controlar tudo",
      "luto contra o que não depende de mim",
      "me esforço demais para ter controle de tudo",

      // Presente, aceitação, tempo
      "tenho dificuldade em aceitar o presente",
      "não aceito o que está acontecendo agora",
      "me sinto pressionado pelo tempo",
      "vivo com pressa e ansiedade",
      "não consigo estar presente no momento",
      "tenho dificuldade de estar no agora",

      // Controle e responsabilidade
      "quero controlar tudo ao meu redor",
      "só posso controlar minhas ações",
      "me cobro por coisas que estão fora do meu alcance",
      "me culpo por coisas fora do meu controle",
      "me sinto impotente diante da vida",
      "tento controlar o incontrolável",

      // Julgamento externo e comparação
      "sofro com o que os outros pensam de mim",
      "me comparo o tempo todo com os outros",
      "fico pensando no que os outros vão achar",

      // Passado e futuro
      "fico remoendo o passado",
      "me sinto ansioso com o futuro",
      "tenho medo do que pode acontecer amanhã",
      "revivo erros antigos",
      "me prendo ao que já passou"
    ]
  },
  {
    arquivo: "eco_observador_presente.txt",
    gatilhos: [
      // Consciência dos pensamentos e emoções
      "percebo meus pensamentos sem julgar",
      "estou tentando observar minhas emoções",
      "quero me tornar mais consciente do que sinto",
      "tento entender o que estou pensando",
      "só quero conseguir me observar melhor",

      // Meta-consciência e presença interior
      "estou tentando me observar em silêncio",
      "me pego reagindo automaticamente",
      "observo como certos pensamentos se repetem",
      "tenho consciência dos meus padrões",
      "quero apenas estar comigo, presente",

      // Práticas de atenção plena ou auto-observação
      "tento ficar presente comigo mesmo",
      "estou aprendendo a silenciar minha mente",
      "quero me conectar com o que estou sentindo agora",
      "estou tentando respirar e perceber o que acontece em mim",
      "quero entender minhas reações antes de agir"
    ]
  }
];
