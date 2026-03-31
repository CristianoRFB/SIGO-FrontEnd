export interface ApiResponse<T> {
  code: number;
  message?: string | null;
  data: T;
}

export interface Cliente {
  Id: number;
  Nome: string;
  Email: string;
  Senha?: string;
  senha?: string;
  Cpf_Cnpj: string;
  Obs?: string;
  Razao?: string;
  razao?: string;
  DataNasc: string;
  Numero: number;
  Rua: string;
  Cidade: string;
  Cep: number;
  Bairro: string;
  Estado: string;
  Pais: string;
  Complemento?: string;
  Sexo: number;
  TipoCliente: number;
  Situacao: number;
  Telefones?: Telefone[] | null;
}

export interface Telefone {
  Id: number;
  Numero: string;
  DDD: number;
  ClienteId?: number;
}

export interface Funcionario {
  Id: number;
  Nome: string;
  Cpf: string;
  Cargo: string;
  Email: string;
  Situacao: number;
}

export interface Servico {
  Id: number;
  Nome: string;
  Descricao: string;
  Valor: number;
  Garantia: string;
}

export interface Marca {
  IdMarca: number;
  NomeMarca: string;
  DescMarca?: string;
  TipoMarca?: string;
}

export interface Cor {
  Id: number;
  NomeCor: string;
}

export interface Veiculo {
  Id: number;
  NomeVeiculo: string;
  TipoVeiculo: string;
  PlacaVeiculo: string;
  ChassiVeiculo: string;
  AnoFab: number;
  Quilometragem: number;
  Combustivel: string;
  Seguro: string;
  Status: number;
  Cores: Cor[];
}

export type SituacaoStatus = 0 | 1 | 2 | 3;
