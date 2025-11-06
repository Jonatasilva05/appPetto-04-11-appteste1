// /data/databaseBreeds.ts

export type Especie = "cachorro" | "gato";

export interface BreedInfo {
  id: string;
  especie: Especie;
  raca: string;
  descricao: string;
  caracteristicas: string[]; 
  energia: "baixa" | "moderada" | "alta";
  inteligencia: "baixa" | "moderada" | "alta";
  sociabilidade: "baixa" | "moderada" | "alta"; 
  protecao: "baixa" | "moderada" | "alta";
  cuidado_pelagem: "baixo" | "moderado" | "alto";
  cuidados: string[]; 
  saudefrequente?: string[]; 
  tamanho?: "mini" | "pequeno" | "médio" | "grande" | "gigante";
}

export const BREEDS_DATABASE: BreedInfo[] = [
  {
    id: "cao_chow_chow",
    especie: "cachorro",
    raca: "Chow Chow",
    descricao: "Robustos, reservados e protetores. Tendem a ser independentes e podem ser desconfiados com estranhos; pedem socialização desde cedo.",
    caracteristicas: [
      "Fortes e vigilantes",
      "Independentes e teimosos",
      "Apego ao tutor, porém reservados",
      "Podem ser territoriais"
    ],
    energia: "moderada",
    inteligencia: "moderada",
    sociabilidade: "moderada",
    protecao: "alta",
    cuidado_pelagem: "alto",
    cuidados: [
      "Escovação frequente (pelagem densa)",
      "Socialização precoce e positiva",
      "Treino consistente e paciente"
    ],
    saudefrequente: ["Displasia coxofemoral", "Problemas dermatológicos", "Ectropion/entropion"],
    tamanho: "grande"
  },
  {
    id: "cao_border_collie",
    especie: "cachorro",
    raca: "Border Collie",
    descricao: "Extremamente inteligentes, ativos e focados no trabalho. Excelentes para esportes caninos; precisam de estímulo mental diário.",
    caracteristicas: [
      "Muito inteligentes e treináveis",
      "Altíssima energia",
      "Sensíveis e atentos",
      "Excelentes pastores"
    ],
    energia: "alta",
    inteligencia: "alta",
    sociabilidade: "alta",
    protecao: "moderada",
    cuidado_pelagem: "moderado",
    cuidados: [
      "Exercícios intensos e diários",
      "Atividades cognitivas (agility, obediência)",
      "Rotina estruturada para evitar tédio"
    ],
    saudefrequente: ["Displasia coxofemoral", "Anomalia do olho do Collie (CEA)"],
    tamanho: "médio"
  },
  {
    id: "cao_shih_tzu",
    especie: "cachorro",
    raca: "Shih Tzu",
    descricao: "Companheiros afetuosos que se adaptam bem a apartamentos. Sua pelagem longa e sedosa requer atenção constante para evitar nós.",
    caracteristicas: [
      "Apegados à família",
      "Temperamento dócil e extrovertido",
      "Baixa exigência de exercício",
      "Boas companhias para idosos"
    ],
    energia: "moderada",
    inteligencia: "moderada",
    sociabilidade: "alta",
    protecao: "baixa",
    cuidado_pelagem: "alto",
    cuidados: [
      "Higiene ocular diária",
      "Escovação e tosa regulares",
      "Cuidado com vias aéreas (braquicefalia)"
    ],
    saudefrequente: ["Problemas oculares", "Síndrome braquicefálica", "Tártaro precoce"],
    tamanho: "pequeno"
  },

  {
    id: "gato_siames",
    especie: "gato",
    raca: "Siamês",
    descricao: "Extremamente comunicativos e apegados, gostam de companhia e de 'conversar'. Precisam de muitas brincadeiras e interação.",
    caracteristicas: [
      "Muito sociáveis e extrovertidos",
      "Ativos e curiosos",
      "Apegados ao tutor",
      "Vocalização intensa e frequente"
    ],
    energia: "alta",
    inteligencia: "alta",
    sociabilidade: "alta",
    protecao: "baixa",
    cuidado_pelagem: "baixo",
    cuidados: [
      "Brinquedos interativos",
      "Ambiente enriquecido (prateleiras, arranhadores)",
      "Companhia frequente para evitar estresse"
    ],
    saudefrequente: ["Problemas dentários", "Sensibilidade respiratória", "Estrabismo"],
    tamanho: "médio"
  },
  {
    id: "gato_persa",
    especie: "gato",
    raca: "Persa",
    descricao: "Calmos, carinhosos e de aparência nobre. São braquicefálicos (focinho achatado) e sua pelagem longa requer escovação diária.",
    caracteristicas: [
      "Temperamento tranquilo e sereno",
      "Afetuosos e dóceis",
      "Pouco atléticos, preferem relaxar",
      "Exigem grooming intensivo"
    ],
    energia: "baixa",
    inteligencia: "moderada",
    sociabilidade: "moderada",
    protecao: "baixa",
    cuidado_pelagem: "alto",
    cuidados: [
      "Escovação diária para evitar nós",
      "Higiene ocular regular",
      "Monitorar respiração (braquicefalia)"
    ],
    saudefrequente: ["Problemas respiratórios", "Dermatites", "Doença renal policística (PKD)"],
    tamanho: "médio"
  },
  {
    id: "gato_srd",
    especie: "gato",
    raca: "Sem Raça Definida (SRD)",
    descricao: "Também conhecidos como 'vira-latas', são muito variados em temperamento e aparência. Geralmente são resistentes e saudáveis. A adaptação depende muito da história de vida de cada indivíduo.",
    caracteristicas: [
      "Diversidade de personalidades",
      "Grande capacidade de adaptação",
      "Podem ser extremamente carinhosos e gratos",
      "Inteligentes e independentes"
    ],
    energia: "moderada",
    inteligencia: "moderada",
    sociabilidade: "moderada",
    protecao: "baixa",
    cuidado_pelagem: "baixo",
    cuidados: [
      "Enriquecimento ambiental é fundamental",
      "Rotina estável para gerar confiança",
      "Check-ups veterinários anuais"
    ],
    saudefrequente: ["Altamente variável, mas geralmente robustos"],
    tamanho: "médio"
  }
];