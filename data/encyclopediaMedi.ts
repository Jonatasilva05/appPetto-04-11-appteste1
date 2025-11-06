// data/encyclopediaMedi.ts

// --- INTERFACES ATUALIZADAS PARA CORRESPONDER AOS SEUS NOVOS DADOS ---
export interface EsquemaVacinal {
  primario: string;
  reforco: string;
  observacoes?: string;
}

export interface RegraUso {
  indicacao?: string[];
  quando_usar?: string;
  intervalo?: string;
  contraindicacoes?: string[];
  efeitos_comuns?: string[];
  observacoes?: string;
}

export interface EncyclopediaItem {
  id: string;
  nome: string;
  alias?: string[];
  previne_trata: string[];
  esquema?: EsquemaVacinal;
  regra: RegraUso;
}

export interface SpeciesEncyclopedia {
  species_value: 'cachorro' | 'gato' | 'passaro' | 'roedor' | 'peixe' | 'tartaruga' | 'outro';
  vaccines: EncyclopediaItem[];
  medications: EncyclopediaItem[];
}
// -----------------------------------------------------------------

export const ENCYCLOPEDIA_MEDI: SpeciesEncyclopedia[] = [
  // ---------------- CACHORRO ----------------
  {
    species_value: 'cachorro',
    vaccines: [
      { 
        id: 'vacina_v10_cao', 
        nome: 'Polivalente (V10)',
        alias: ['Múltipla', 'Decuple'],
        previne_trata: ["Cinomose", "Parvovirose", "Hepatite Infecciosa", "Parainfluenza", "Coronavirose", "Leptospirose (4 tipos)"],
        esquema: {
            primario: '3 a 4 doses no primeiro ano de vida (iniciando com 45-60 dias).',
            reforco: 'Anual.'
        },
        regra: {
            contraindicacoes: ["Animais doentes ou febris", "Reação alérgica prévia"],
            efeitos_comuns: ["Dor local", "Sonolência leve", "Febre baixa por 24h"],
            observacoes: 'A vacina V8 tem cobertura similar, mas para menos tipos de Leptospirose.'
        }
      },
      { 
        id: 'vacina_rabica_cao_gato', 
        nome: 'Antirrábica (Raiva)',
        alias: ['Raiva'],
        previne_trata: ["Raiva"],
        esquema: {
            primario: 'Dose única a partir dos 3-4 meses de idade.',
            reforco: 'Anual (obrigatória por lei).'
        },
        regra: {
            efeitos_comuns: ["Dor local", "Inchaço pequeno no local da aplicação"],
            observacoes: 'A raiva é uma zoonose fatal. A vacinação é a única forma de prevenção.'
        }
      },
      { 
        id: 'vacina_gripe_canina', 
        nome: 'Gripe Canina',
        alias: ['Tosse dos Canis', 'Bordetella'],
        previne_trata: ["Traqueobronquite Infecciosa Canina"],
        esquema: {
            primario: 'Dose única ou dupla, dependendo da apresentação (oral ou injetável).',
            reforco: 'Anual, especialmente para cães com alto contato social.'
        },
        regra: {
            contraindicacoes: ["Animais com sintomas respiratórios ativos"],
            efeitos_comuns: ["Espirros (vacina intranasal)", "Tosse leve por 1-2 dias"],
            observacoes: 'Altamente recomendada para cães que frequentam creches, hotéis ou parques.'
        }
      }
    ],
    medications: [
      { 
        id: 'vermifugo_oral_cao_gato', 
        nome: 'Vermífugo Oral',
        alias: ['Remédio de verme'],
        previne_trata: ["Vermes intestinais (lombrigas, tênias)", "Giárdia (alguns tipos)"],
        regra: {
            contraindicacoes: ["Fêmeas gestantes (alguns tipos)", "Animais muito debilitados sem orientação veterinária"],
            efeitos_comuns: ["Vômito ou diarreia leve, caso a carga parasitária seja alta"],
            observacoes: 'A frequência (3, 4 ou 6 meses) deve ser definida por um veterinário com base no estilo de vida do pet.'
        }
      },
      { 
        id: 'antipulgas_carrapatos_cao_gato', 
        nome: 'Antipulgas e Carrapatos',
        alias: ['Remédio de pulga'],
        previne_trata: ["Pulgas", "Carrapatos", "Piolhos", "Sarnas (alguns tipos)"],
        regra: {
            contraindicacoes: ["Filhotes com idade ou peso inferior ao recomendado na bula"],
            efeitos_comuns: ["Reações cutâneas leves no local da aplicação (pipetas)"],
            observacoes: 'Existem opções orais (comprimidos), tópicas (pipetas) e coleiras, com durações de 1 a 8 meses.'
        }
      }
    ],
  },
  // ---------------- GATO ----------------
  {
    species_value: 'gato',
    vaccines: [
        { 
            id: 'vacina_v4_gato', 
            nome: 'Polivalente Felina (V4)',
            alias: ['Quádrupla Felina'],
            previne_trata: ["Rinotraqueíte", "Calicivirose", "Panleucopenia", "Clamidiose"],
            esquema: {
                primario: '2 a 3 doses no primeiro ano de vida (iniciando com 60 dias).',
                reforco: 'Anual.'
            },
            regra: {
                observacoes: 'A V5 inclui proteção contra Leucemia Felina (FeLV) e é recomendada para gatos com acesso à rua ou contato com outros gatos não testados.'
            }
        },
    ],
    medications: [
        {
            id: 'malte_gato',
            nome: 'Pasta de Malte',
            alias: ['Removedor de bola de pelo'],
            previne_trata: ["Acúmulo de bolas de pelo no trato digestivo"],
            regra: {
                observacoes: 'Ajuda a lubrificar e eliminar os pelos ingeridos durante a lambedura, prevenindo vômitos e constipação.'
            }
        }
    ],
  },
   // ... (outras espécies que você já adicionou)
   {
    species_value: 'passaro',
    vaccines: [
        { 
            id: 'vacina_newcastle', 
            nome: 'Vacina contra Newcastle',
            previne_trata: ["Doença de Newcastle"],
            esquema: {
                primario: 'Aplicação geralmente em gotas na água ou spray nas primeiras semanas de vida.',
                reforco: 'Reforços periódicos dependendo do manejo.'
            },
            regra: {
                observacoes: 'Obrigatória em criações comerciais, recomendada para aves de companhia em áreas de risco.'
            }
        }
    ],
    medications: [
      { 
        id: 'vermifugo_aves', 
        nome: 'Vermífugo Aviário',
        previne_trata: ["Vermes gastrointestinais"],
        regra: {
            observacoes: 'Deve ser administrado conforme recomendação de veterinário especialista em aves.'
        }
      },
      { 
        id: 'suplemento_calcio_aves', 
        nome: 'Suplemento de Cálcio',
        previne_trata: ["Deficiência mineral", "Osteoporose aviária"],
        regra: {
            observacoes: 'Indispensável para aves que botam ovos.'
        }
      }
    ]
  },
  {
    species_value: 'roedor',
    vaccines: [],
    medications: [
        { 
            id: 'vitamina_c_roedor',
            nome: 'Vitamina C',
            previne_trata: ["Escorbuto em porquinhos-da-índia"],
            regra: {
                observacoes: 'Essencial na dieta de porquinhos-da-índia, pode ser dada em gotas ou alimentos enriquecidos.'
            }
        },
        { 
            id: 'vermifugo_roedor',
            nome: 'Vermífugo para Roedores',
            previne_trata: ["Parasitas internos"],
            regra: {
                observacoes: 'Uso somente sob prescrição veterinária.'
            }
        }
    ]
  },
];