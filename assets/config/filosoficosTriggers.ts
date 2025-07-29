/* assets/config/filosoficosTriggerMap.ts
   ────────────────────────────────────── */

export interface ModuloFilosoficoTrigger {
  arquivo: string;
  gatilhos: string[];
}

export const filosoficosTriggerMap: ModuloFilosoficoTrigger[] = [
  {
    arquivo: 'eco_corpo_emocao.txt',
    gatilhos: [
      'corpo',
      'peito',
      'garganta',
      'dor física',
      'trava',
      'sensação física',
      'tensão corporal',
      'reage no corpo',
      'aperto',
      'manifestação física'
    ]
  },
  {
    arquivo: 'eco_observador_presente.txt',
    gatilhos: [
      'observando',
      'me vejo',
      'testemunha',
      'consciência',
      'assistindo',
      'parte que observa',
      'ver de fora',
      'consciência do agora',
      'eu noto',
      'consigo ver meus pensamentos'
    ]
  },
  {
    arquivo: 'eco_identificacao_mente.txt',
    gatilhos: [
      'mente',
      'pensamentos',
      'não paro de pensar',
      'domina minha cabeça',
      'refém da mente',
      'minha cabeça',
      'controle mental',
      'confusão mental',
      'só penso nisso',
      'briga interna'
    ]
  },
  {
    arquivo: 'eco_presenca_silenciosa.txt',
    gatilhos: [
      'silêncio',
      'paz',
      'quietude',
      'cansaço',
      'parar',
      'não quero pensar',
      'alma cansada',
      'parar tudo',
      'descanso profundo',
      'não sentir'
    ]
  },
  {
    arquivo: 'eco_fim_do_sofrimento.txt',
    gatilhos: [
      'sofrimento',
      'dor constante',
      'cansado de sofrer',
      'não aguento mais',
      'sofrer o tempo todo',
      'dor emocional',
      'não passa nunca',
      'não sei como sair disso',
      'dor persistente',
      'exausto de sentir isso'
    ]
  }
];
