// data/databaseBreedInfo.ts

export interface BreedInfo {
  id: number;
  breed_value: string; // Chave de conexão (mesmo 'value' de databasePets.ts)
  raca: string;        // Nome para exibição
  descricao: string;
  caracteristicas: string[];
  cuidados: string[];
}

export const BREEDS_DATABASE: BreedInfo[] = [
  {
    id: 1,
    breed_value: "chow_chow",
    raca: "Chow Chow",
    descricao: "Cães robustos e imponentes, conhecidos por sua lealdade e instinto protetor. Podem ser reservados e um pouco independentes, exigindo socialização desde cedo.",
    caracteristicas: [
      "Forte e protetor",
      "Independente e reservado",
      "Leal à família",
      "Pode ser teimoso"
    ],
    cuidados: [
      "Escovação frequente do pelo denso",
      "Exercícios moderados",
      "Socialização desde filhote é crucial"
    ]
  },
  {
    id: 2,
    breed_value: "border_collie",
    raca: "Border Collie",
    descricao: "Extremamente inteligentes e ativos, considerados os cães mais obedientes e treináveis. Necessitam de estímulo físico e mental diário para não ficarem entediados.",
    caracteristicas: [
      "Altamente inteligente",
      "Muito enérgico",
      "Amigável e leal",
      "Excelente em esportes caninos"
    ],
    cuidados: [
      "Exercícios intensos todos os dias",
      "Treinamento constante e desafios mentais",
      "Não é ideal para apartamentos ou donos sedentários"
    ]
  },
  {
    id: 3,
    breed_value: "pug",
    raca: "Pug",
    descricao: "Pugs são cães de companhia por excelência. São charmosos, brincalhões e muito apegados aos seus donos. Por serem braquicefálicos (focinho achatado), não toleram bem o calor ou exercícios intensos.",
    caracteristicas: [
      "Brincalhão e sociável",
      "Dócil com crianças",
      "Apegado ao dono",
      "Propenso a problemas respiratórios"
    ],
    cuidados: [
      "Limpeza regular das rugas faciais",
      "Evitar calor excessivo",
      "Controlar o peso para evitar obesidade"
    ]
  },
  {
    id: 4,
    breed_value: "siames",
    raca: "Siamês",
    descricao: "Gatos sociáveis e muito 'faladores', com forte apego aos donos. Exigem bastante atenção e interações diárias para não se sentirem sozinhos ou entediados.",
    caracteristicas: [
      "Muito comunicativo (mia bastante)",
      "Apegado e leal ao dono",
      "Ativo e inteligente",
      "Curioso"
    ],
    cuidados: [
      "Necessita de atenção diária e brincadeiras",
      "Enriquecimento ambiental com brinquedos e arranhadores",
      "Check-ups veterinários regulares"
    ]
  }
  // Adicione mais raças aqui conforme sua necessidade
];