/* assets/config/heuristicasTriggers.ts
   ────────────────────────────────────────── */

export interface HeuristicaTrigger {
  arquivo: string;
  gatilhos: string[];
}

/* ───────── Heurísticas + frases-gatilho ───────── */
export const heuristicasTriggerMap: HeuristicaTrigger[] = [
  {
    arquivo: 'eco_heuristica_ancoragem.txt',
    gatilhos: [
      'antes era melhor',
      'nada se compara',
      'ja estive bem',
      'não aceito menos',
      'depois do que aconteceu'
    ]
  },
  {
    arquivo: 'eco_heuristica_causas_superam_estatisticas.txt',
    gatilhos: [
      'aconteceu comigo',
      'eu vivi isso',
      'sei que parece raro',
      'mas no meu caso',
      'é diferente comigo'
    ]
  },
  {
    arquivo: 'eco_heuristica_disponibilidade.txt',
    gatilhos: [
      'acabei de ver',
      'todo mundo fala',
      'está em todo lugar'
    ]
  },
  {
    arquivo: 'eco_heuristica_disponibilidade_emocao_risco.txt',
    gatilhos: [
      'tenho medo de tentar',
      'sempre da errado',
      'ja sofri demais',
      'vai dar problema',
      'vai quebrar a cara'
    ]
  },
  {
    arquivo: 'eco_heuristica_excesso_confianca.txt',
    gatilhos: [
      'nao tem como dar errado',
      'certeza absoluta',
      '100% garantido'
    ]
  },
  {
    arquivo: 'eco_heuristica_certeza_emocional.txt',
    gatilhos: [
      'claramente certo',
      'ja esta decidido',
      'é evidente',
      'eu tinha certeza',
      'tudo confirmava',
      'era obvio demais',
      'parecia destino',
      'não podia estar enganado',
      'intuição dizia isso',
      'forçar a realidade',
      'estava tudo alinhado',
      'me senti guiado',
      'parecia que era pra ser',
      'eu sabia que era o caminho'
    ]
  },
  {
    arquivo: 'eco_heuristica_ilusao_validade.txt',
    gatilhos: [
      'convicção total',
      'só podia ser isso',
      'confiança absoluta',
      'acertamos em cheio',
      'estava tudo indicando isso',
      'não tem dúvida',
      'é a única explicação',
      'é isso e pronto',
      'está tudo se encaixando',
      'não tenho mais dúvidas',
      'sei exatamente onde isso vai parar',
      'está claro como o dia',
      'não tem como ser diferente dessa vez',
      'já vi esse padrão antes',
      'eu sinto isso com uma força',
      'é tão coerente que não pode estar errado'
    ]
  },
  {
    arquivo: 'eco_heuristica_lei_pequenos_numeros.txt',
    gatilhos: [
      'so precisei de dois casos',
      'funcionou 3 vezes',
      'amostra pequena'
    ]
  },
  {
    arquivo: 'eco_heuristica_regressao_media.txt',
    gatilhos: [
      'perdi a mao',
      'pior que antes',
      'foi sorte',
      'nunca consigo manter',
      'desandei'
    ]
  },
  {
    arquivo: 'eco_heuristica_taxabase_causal.txt',
    gatilhos: [
      'so acontece ali',
      'é sempre esse grupo',
      'estereotipo'
    ]
  },
  {
    arquivo: 'eco_heuristica_intuicao_especialista.txt',
    gatilhos: [
      'ele sempre acerta',
      'ela tem um feeling',
      'esse tipo de pessoa sabe',
      'a experiência dele fala mais alto',
      'não tem como ela errar',
      'esse cara entende',
      'ele tem um instinto pra isso',
      'segui o que ele sentiu',
      'ela sente essas coisas',
      'foi pelo que ele falou',
      'confio no faro dele'
    ]
  },
  {
    arquivo: 'heuristica_ilusao_compreensao.txt',
    gatilhos: [
      'eu sabia que ia dar errado',
      'era óbvio demais',
      'claro que isso ia acontecer',
      'sempre soube',
      'já dava pra ver',
      'estava na cara',
      'todo mundo dizia',
      'essas coisas sempre se repetem comigo',
      'já percebi logo de cara',
      'não era surpresa',
      'já esperava por isso'
    ]
  },
  {
    arquivo: 'heuristica_previsao_regressiva.txt',
    gatilhos: [
      'vai explodir de crescer',
      'vai bombar',
      'certeza de sucesso',
      'vai fracassar com certeza'
    ]
  }
];

/* ───────── Tags associadas a cada heurística ───────── */
export const tagsPorHeuristica: Record<string, string[]> = {
  'eco_heuristica_ancoragem.txt': [
    'ancoragem', 'comparacao_passado', 'referencia_fixa'
  ],
  'eco_heuristica_causas_superam_estatisticas.txt': [
    'caso_unico', 'estatistica_ignore', 'historia_forte'
  ],
  'eco_heuristica_disponibilidade.txt': [
    'disponibilidade', 'repeticao_midia'
  ],
  'eco_heuristica_disponibilidade_emocao_risco.txt': [
    'disponibilidade_risco', 'medo', 'memoria_viva'
  ],
  'eco_heuristica_excesso_confianca.txt': [
    'excesso_confianca', 'certeza', 'arrogancia'
  ],
  'eco_heuristica_certeza_emocional.txt': [
    'certeza_emocional', 'coerencia_narrativa', 'conviccao_rapida'
  ],
  'eco_heuristica_ilusao_validade.txt': [
    'ilusao_validade', 'validacao_subjetiva', 'superconfianca', 'feedback_limitado'
  ],
  'eco_heuristica_lei_pequenos_numeros.txt': [
    'pequena_amostra', 'lei_numeros', 'generalizacao'
  ],
  'eco_heuristica_regressao_media.txt': [
    'regressao_media', 'sorte', 'volta_normal'
  ],
  'eco_heuristica_taxabase_causal.txt': [
    'taxabase', 'estereotipo', 'causalidade_aparente'
  ],
  'eco_heuristica_intuicao_especialista.txt': [
    'intuicao_especialista', 'autoridade_confiança', 'ambiente_instavel', 'feedback_ausente'
  ],
  'heuristica_ilusao_compreensao.txt': [
    'ilusao_compreensao', 'narrativa_passado', 'certeza_excessiva', 'explicacao_causal_simples'
  ],
  'heuristica_previsao_regressiva.txt': [
    'previsao_regressiva', 'super_otimismo', 'super_pessimismo'
  ]
};
