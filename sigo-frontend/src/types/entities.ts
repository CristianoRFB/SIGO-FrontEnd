export interface ApiResponse<T> {
  code?: number;
  Code?: number;
  message?: string | null;
  Message?: string | null;
  data: T;
}

export interface Telefone {
  Id: number;
  Numero: string;
  DDD?: number;
  ClienteId?: number;
}

export interface Cliente {
  Id: number;
  Nome: string;
  Email: string;
  senha?: string;
  Cpf_Cnpj: string;
  Obs?: string;
  razao?: string;
  DataNasc: string;
  Numero: number;
  Rua: string;
  Cidade: string;
  Cep: string;
  Bairro: string;
  Estado: string;
  Pais: string;
  Complemento?: string;
  Sexo: number;
  TipoCliente: number;
  Situacao: number;
  Telefones?: Telefone[] | null;
  Veiculos?: Veiculo[] | null;
}

export interface Funcionario {
  Id: number;
  Nome: string;
  Cpf: string;
  Cargo: string;
  Senha?: string;
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
  Id: number;
  Nome: string;
  Desc?: string;
  TipoMarca?: string;
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
  Cor?: string;
  ClienteId: number;
  CorId?: number;
  Status: number;
  Situacao?: number;
}

export type SituacaoStatus = 1 | 2;
