export interface Store {
  id: number;
  codigo: string;
  nome: string;
  razaoSocial: string | null;
  cnpj: string | null;
  status: string;
  unidadeNegocio: string | null;
  grupoFinanceiro: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  regional: string | null;
  diretor: string | null;
  telefone: string | null;
  whatsapp: string | null;
  emailLoja: string | null;
  emailGerente: string | null;
  horaAbertura: string | null;
  horaFechamento: string | null;
  ip: string | null;
  linkInternet: string | null;
  operadora: string | null;
  tipoConexao: string | null;
  qtdePdvs: number | null;
  servidorLocal: string | null;
  modeloEquipamento: string | null;
  versaoMegastore: string | null;
  versaoRetaguarda: string | null;
  versaoFrente: string | null;
  ambiente: string | null;
  homologacao: string | null;
  observacoes: string | null;
  ultimaAtualizacao: string | null;
  fornecedorAtendimento: "TI Partner" | "C4" | null;
  possuiTaxaDeslocamento: boolean;
  isFavorite: boolean;
}

export interface StoresResponse {
  stores: Store[];
  total: number;
  page: number;
  totalPages: number;
}
