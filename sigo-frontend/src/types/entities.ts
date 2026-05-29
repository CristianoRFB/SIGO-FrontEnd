export interface ApiResponse<T> {
  code?: number;
  Code?: number;
  message?: string | null;
  Message?: string | null;
  data?: T;
  Data?: T;
}

export type UserRole = "Admin" | "Funcionario" | "Oficina" | "Cliente";

export interface Telefone {
  Id: number;
  Numero: string;
  DDD?: number | string;
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
  IdOficina?: number | null;
  Role?: UserRole | string;
}

export interface FuncionarioServico {
  IdFuncionario: number;
  IdServico: number;
}

export interface Servico {
  Id: number;
  Nome: string;
  Descricao: string;
  Valor: number;
  Garantia: string;
  IdOficina?: number | null;
  Funcionario_Servicos?: FuncionarioServico[] | null;
}

export interface Marca {
  Id: number;
  Nome: string;
  Desc?: string;
  TipoMarca?: string;
}

export interface Peca {
  Id: number;
  Nome: string;
  Tipo: string;
  Descricao: string;
  Valor: number;
  Quantidade: number;
  Garantia: string;
  Unidade: number;
  IdMarca: number;
  DataAquisicao: string;
  Fornecedor: string;
  IdOficina?: number | null;
}

export interface Cor {
  Id: number;
  NomeCor: string;
}

export interface VeiculoImagem {
  Id: number;
  NomeArquivo: string;
  ContentType?: string;
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
  Status?: number;
  Situacao?: number;
  Imagens?: VeiculoImagem[] | null;
}

export interface PedidoServico {
  IdPedido: number;
  IdServico: number;
  QuantVezes: number;
}

export interface PedidoPeca {
  IdPedido: number;
  IdPeca: number;
  Quantidade: number;
  DataInstalacao: string;
  Estado: string;
  Observacao: string;
}

export interface Pedido {
  Id: number;
  idCliente: number;
  idFuncionario: number;
  idOficina: number;
  idVeiculo: number;
  ValorTotal: number;
  DescontoReais: number;
  DescontoPorcentagem: number;
  DescontoTotalReais: number;
  DescontoServicoPorcentagem: number;
  DescontoServicoReais: number;
  DescontoPecaPorcentagem: number;
  descontoPecaReais: number;
  Observacao: string;
  DataInicio: string;
  DataFim: string;
  Pedido_Pecas: PedidoPeca[];
  Pedido_Servicos: PedidoServico[];
}

export interface Relatorio {
  veiculoId: number;
  fileName: string;
  contentType: string;
  blob: Blob;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  oficinaId?: number | null;
  exp?: number | null;
  token?: string;
}

export type SituacaoStatus = 1 | 2;
