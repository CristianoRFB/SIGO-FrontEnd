import { ApiResponse, Servico } from "@/types/entities";
import { buildBackendUrl } from "@/lib/config";
import { apiFetch } from "./api-client";
import { unwrapArray, unwrapData } from "./service-utils";

const BASE_URL = buildBackendUrl("Servico");

type RawServico = Partial<Servico> & {
  id?: number;
  nome?: string;
  descricao?: string;
  valor?: number;
  garantia?: string;
};

function normalizeServico(servico: RawServico): Servico {
  return {
    Id: servico.Id ?? servico.id ?? 0,
    Nome: servico.Nome ?? servico.nome ?? "",
    Descricao: servico.Descricao ?? servico.descricao ?? "",
    Valor: servico.Valor ?? servico.valor ?? 0,
    Garantia: servico.Garantia ?? servico.garantia ?? "",
  };
}

export async function listServicos(): Promise<Servico[]> {
  const payload = await apiFetch(BASE_URL);
  return unwrapArray<RawServico>(payload).map(normalizeServico);
}

export async function getServico(id: number): Promise<Servico | null> {
  const payload = await apiFetch(`${BASE_URL}/id/${id}`);
  const servico = unwrapData<RawServico>(payload);
  return servico ? normalizeServico(servico) : null;
}

export async function createServico(
  servico: Partial<Servico>
): Promise<ApiResponse<Servico>> {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(servico),
  });
}

export async function updateServico(
  id: number,
  servico: Partial<Servico>
): Promise<ApiResponse<Servico>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(servico),
  });
}

export async function deleteServico(id: number): Promise<ApiResponse<null>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function searchServicoByNome(nome: string): Promise<Servico[]> {
  const payload = await apiFetch(`${BASE_URL}/name/${encodeURIComponent(nome)}`);
  return unwrapArray<RawServico>(payload).map(normalizeServico);
}
