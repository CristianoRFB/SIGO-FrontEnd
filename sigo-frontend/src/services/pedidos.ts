import { buildBackendUrl } from "@/lib/config";
import type {
  ApiResponse,
  Funcionario,
  Pedido,
  PedidoPeca,
  PedidoServico,
  Servico,
} from "@/types/entities";
import { apiFetch } from "./api-client";
import { unwrapArray, unwrapData } from "./service-utils";

const BASE_URL = buildBackendUrl("pedidos");

type RawPedidoServico = Partial<PedidoServico> & {
  idPedido?: number;
  idServico?: number;
  quantVezes?: number;
};

type RawPedidoPeca = Partial<PedidoPeca> & {
  idPedido?: number;
  idPeca?: number;
  quantidade?: number;
  dataInstalacao?: string;
  estado?: string;
  observacao?: string;
};

type RawPedido = Partial<Pedido> & {
  id?: number;
  valorTotal?: number;
  descontoReais?: number;
  descontoPorcentagem?: number;
  descontoTotalReais?: number;
  descontoServicoPorcentagem?: number;
  descontoServicoReais?: number;
  descontoPecaPorcentagem?: number;
  observacao?: string;
  dataInicio?: string;
  dataFim?: string;
  pedido_Pecas?: RawPedidoPeca[];
  pedidoPecas?: RawPedidoPeca[];
  pedido_Servicos?: RawPedidoServico[];
  pedidoServicos?: RawPedidoServico[];
};

type RawServico = Partial<Servico> & {
  id?: number;
  nome?: string;
  descricao?: string;
  valor?: number;
  garantia?: string;
};

type RawFuncionario = Partial<Funcionario> & {
  id?: number;
  nome?: string;
  cpf?: string;
  cargo?: string;
  email?: string;
  situacao?: number;
};

function normalizePedidoServico(servico: RawPedidoServico): PedidoServico {
  return {
    IdPedido: servico.IdPedido ?? servico.idPedido ?? 0,
    IdServico: servico.IdServico ?? servico.idServico ?? 0,
    QuantVezes: servico.QuantVezes ?? servico.quantVezes ?? 0,
  };
}

function normalizePedidoPeca(peca: RawPedidoPeca): PedidoPeca {
  return {
    IdPedido: peca.IdPedido ?? peca.idPedido ?? 0,
    IdPeca: peca.IdPeca ?? peca.idPeca ?? 0,
    Quantidade: peca.Quantidade ?? peca.quantidade ?? 0,
    DataInstalacao: peca.DataInstalacao ?? peca.dataInstalacao ?? "",
    Estado: peca.Estado ?? peca.estado ?? "",
    Observacao: peca.Observacao ?? peca.observacao ?? "",
  };
}

function normalizePedido(pedido: RawPedido): Pedido {
  return {
    Id: pedido.Id ?? pedido.id ?? 0,
    idCliente: pedido.idCliente ?? 0,
    idFuncionario: pedido.idFuncionario ?? 0,
    idOficina: pedido.idOficina ?? 0,
    idVeiculo: pedido.idVeiculo ?? 0,
    ValorTotal: pedido.ValorTotal ?? pedido.valorTotal ?? 0,
    DescontoReais: pedido.DescontoReais ?? pedido.descontoReais ?? 0,
    DescontoPorcentagem: pedido.DescontoPorcentagem ?? pedido.descontoPorcentagem ?? 0,
    DescontoTotalReais: pedido.DescontoTotalReais ?? pedido.descontoTotalReais ?? 0,
    DescontoServicoPorcentagem:
      pedido.DescontoServicoPorcentagem ?? pedido.descontoServicoPorcentagem ?? 0,
    DescontoServicoReais: pedido.DescontoServicoReais ?? pedido.descontoServicoReais ?? 0,
    DescontoPecaPorcentagem:
      pedido.DescontoPecaPorcentagem ?? pedido.descontoPecaPorcentagem ?? 0,
    descontoPecaReais: pedido.descontoPecaReais ?? 0,
    Observacao: pedido.Observacao ?? pedido.observacao ?? "",
    DataInicio: pedido.DataInicio ?? pedido.dataInicio ?? "",
    DataFim: pedido.DataFim ?? pedido.dataFim ?? "",
    Pedido_Pecas: (
      pedido.Pedido_Pecas ??
      pedido.pedido_Pecas ??
      pedido.pedidoPecas ??
      []
    ).map(normalizePedidoPeca),
    Pedido_Servicos: (
      pedido.Pedido_Servicos ??
      pedido.pedido_Servicos ??
      pedido.pedidoServicos ??
      []
    ).map(normalizePedidoServico),
  };
}

function normalizeServico(servico: RawServico): Servico {
  return {
    Id: servico.Id ?? servico.id ?? 0,
    Nome: servico.Nome ?? servico.nome ?? "",
    Descricao: servico.Descricao ?? servico.descricao ?? "",
    Valor: servico.Valor ?? servico.valor ?? 0,
    Garantia: servico.Garantia ?? servico.garantia ?? "",
    IdOficina: servico.IdOficina ?? null,
    Funcionario_Servicos: servico.Funcionario_Servicos ?? null,
  };
}

function normalizeFuncionario(funcionario: RawFuncionario): Funcionario {
  return {
    Id: funcionario.Id ?? funcionario.id ?? 0,
    Nome: funcionario.Nome ?? funcionario.nome ?? "",
    Cpf: funcionario.Cpf ?? funcionario.cpf ?? "",
    Cargo: funcionario.Cargo ?? funcionario.cargo ?? "",
    Email: funcionario.Email ?? funcionario.email ?? "",
    Situacao: funcionario.Situacao ?? funcionario.situacao ?? 0,
    IdOficina: funcionario.IdOficina ?? null,
    Role: funcionario.Role,
  };
}

export async function listPedidos() {
  const payload = await apiFetch(BASE_URL);
  return unwrapArray<RawPedido>(payload).map(normalizePedido);
}

export async function getPedido(id: number) {
  const payload = await apiFetch(`${BASE_URL}/${id}`);
  const pedido = unwrapData<RawPedido>(payload);
  return pedido ? normalizePedido(pedido) : null;
}

export async function createPedido(
  pedido: Partial<Pedido>
): Promise<ApiResponse<Pedido>> {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(pedido),
  });
}

export async function updatePedido(
  id: number,
  pedido: Partial<Pedido>
): Promise<ApiResponse<Pedido>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(pedido),
  });
}

export async function deletePedido(id: number): Promise<ApiResponse<null>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function listMyPedidoServices() {
  const payload = await apiFetch(`${BASE_URL}/me/servicos`);
  return unwrapArray<RawServico>(payload).map(normalizeServico);
}

export async function listMyPedidoEmployees() {
  const payload = await apiFetch(`${BASE_URL}/me/funcionarios`);
  return unwrapArray<RawFuncionario>(payload).map(normalizeFuncionario);
}
