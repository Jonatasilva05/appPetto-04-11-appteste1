// data/databaseHealthReference.ts

export interface VaccineInfo {
  id: string;
  nome: string;
  descricao: string;
  aplicacao: string;
  species: ("cachorro" | "gato")[];
}

export interface MedicationInfo {
  id: string;
  nome: string;
  descricao: string;
  aplicacao: string;
  species: ("cachorro" | "gato")[];
}

export const MEDICAL_DATABASE: { vacinas: VaccineInfo[]; medicamentos: MedicationInfo[] } = {
  vacinas: [
    {
      id: "vacina_v10_cao",
      nome: "Polivalente (V8 ou V10)",
      descricao: "Protege contra cinomose, hepatite infecciosa, parvovirose, adenovirose e leptospirose.",
      aplicacao: "Iniciar entre 6 a 8 semanas de vida, com 2 a 3 reforços. Revacinação anual.",
      species: ["cachorro"]
    },
    {
      id: "vacina_v4_gato",
      nome: "Polivalente Felina (V4 ou V5)",
      descricao: "Protege contra rinotraqueíte, calicivirose, panleucopenia e clamidiose. A V5 inclui FeLV.",
      aplicacao: "Iniciar com 60 dias de vida, com reforços. Revacinação anual.",
      species: ["gato"]
    },
    {
      id: "vacina_rabica_cao_gato",
      nome: "Antirrábica",
      descricao: "Previne a raiva, zoonose fatal e obrigatória por lei.",
      aplicacao: "Dose única a partir dos 4 meses, com reforço anual.",
      species: ["cachorro", "gato"]
    },
    {
      id: "vacina_gripe_canina",
      nome: "Gripe Canina",
      descricao: "Protege contra a tosse dos canis (traqueobronquite infecciosa canina).",
      aplicacao: "Duas doses iniciais com intervalo de 2-4 semanas. Reforço anual.",
      species: ["cachorro"]
    }
  ],
  medicamentos: [
    {
      id: "vermifugo_oral_cao_gato",
      nome: "Vermífugo",
      descricao: "Combate parasitas intestinais. Deve ser administrado periodicamente.",
      aplicacao: "A cada 3 a 6 meses para adultos. Filhotes com frequência maior.",
      species: ["cachorro", "gato"]
    },
    {
      id: "antipulgas_carrapatos_cao_gato",
      nome: "Antipulgas e Carrapatos",
      descricao: "Controla pulgas e carrapatos, prevenindo doenças como a 'doença do carrapato'.",
      aplicacao: "Mensal ou trimestral, conforme o produto (pipeta, oral, coleira).",
      species: ["cachorro", "gato"]
    },
    {
      id: "malte_gato",
      nome: "Pasta de Malte",
      descricao: "Ajuda na eliminação de bolas de pelo ingeridas durante a lambedura.",
      aplicacao: "Uso regular conforme necessidade do gato.",
      species: ["gato"]
    }
  ]
};
