// data/databaseMedi.ts

export interface HealthItem {
  id: string; 
  name: string; 
  category: 'Essencial' | 'Opcional' | 'Complementar'; 
}

export interface SpeciesHealth {
  species_value: 'cachorro' | 'gato' | 'passaro' | 'roedor' | 'peixe' | 'tartaruga' | 'outro';
  vaccines: HealthItem[];
  medications: HealthItem[];
}

export const HEALTH_DATA: SpeciesHealth[] = [
  {
    species_value: 'cachorro',
    vaccines: [
      { id: 'vacina_v10_cao', name: 'Polivalente V8 ou V10 (Cinomose, Parvovirose, etc.)', category: 'Essencial' },
      { id: 'vacina_rabica_cao_gato', name: 'Antirrábica (Raiva)', category: 'Essencial' },
      { id: 'vacina_gripe_canina', name: 'Gripe Canina (Tosse dos Canis)', category: 'Opcional' },
    ],
    medications: [
      { id: 'vermifugo_oral_cao_gato', name: 'Vermífugo (Comprimido Oral)', category: 'Essencial' },
      { id: 'antipulgas_carrapatos_cao_gato', name: 'Antipulgas e Carrapatos (Oral/Tópico)', category: 'Essencial' },
    ],
  },
  {
    species_value: 'gato',
    vaccines: [
      { id: 'vacina_v4_gato', name: 'Polivalente Felina V4 ou V5', category: 'Essencial' },
      { id: 'vacina_rabica_cao_gato', name: 'Antirrábica (Raiva)', category: 'Essencial' },
    ],
    medications: [
      { id: 'vermifugo_oral_cao_gato', name: 'Vermífugo (Comprimido Oral)', category: 'Essencial' },
      { id: 'antipulgas_carrapatos_cao_gato', name: 'Antipulgas e Carrapatos (Oral/Tópico)', category: 'Essencial' },
      { id: 'malte_gato', name: 'Pasta de Malte (Controle de bolas de pelo)', category: 'Complementar' },
    ],
  },
  {
    species_value: 'passaro',
    vaccines: [
      { id: 'vacina_newcastle', name: 'Vacina contra Newcastle', category: 'Essencial' },
    ],
    medications: [
      { id: 'vermifugo_aves', name: 'Vermífugo Aviário', category: 'Essencial' },
      { id: 'suplemento_calcio_aves', name: 'Suplemento de Cálcio', category: 'Complementar' },
    ],
  },
  {
    species_value: 'roedor',
    vaccines: [],
    medications: [
      { id: 'vitamina_c_roedor', name: 'Vitamina C', category: 'Essencial' },
      { id: 'vermifugo_roedor', name: 'Vermífugo para Roedores', category: 'Essencial' },
    ],
  },
  {
    species_value: 'peixe',
    vaccines: [],
    medications: [],
  },
  {
    species_value: 'tartaruga',
    vaccines: [],
    medications: [],
  },
  {
    species_value: 'outro',
    vaccines: [],
    medications: [],
  }
];
