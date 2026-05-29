import { buildBackendUrl } from "@/lib/config";
import { ApiResponse, Peca } from "@/types/entities";
import { apiFetch } from "./api-client";
import { unwrapArray, unwrapData } from "./service-utils";

const BASE_URL = buildBackendUrl("pecas");

type RawPeca = Partial<Peca> & {
  id?: number;
  nome?: string;
  tipo?: string;
  descricao?: string;
  valor?: number;
  quantidade?: number;
  garantia?: string;
  unidade?: number;
  idMarca?: number;
  dataAquisicao?: string;
  fornecedor?: string;
  idOficina?: number | null;
};

function normalizePeca(peca: RawPeca): Peca {
  return {
    Id: peca.Id ?? peca.id ?? 0,
    Nome: peca.Nome ?? peca.nome ?? "",
    Tipo: peca.Tipo ?? peca.tipo ?? "",
    Descricao: peca.Descricao ?? peca.descricao ?? "",
    Valor: peca.Valor ?? peca.valor ?? 0,
    Quantidade: peca.Quantidade ?? peca.quantidade ?? 0,
    Garantia: peca.Garantia ?? peca.garantia ?? "",
    Unidade: peca.Unidade ?? peca.unidade ?? 0,
    IdMarca: peca.IdMarca ?? peca.idMarca ?? 0,
    DataAquisicao: peca.DataAquisicao ?? peca.dataAquisicao ?? "",
    Fornecedor: peca.Fornecedor ?? peca.fornecedor ?? "",
    IdOficina: peca.IdOficina ?? peca.idOficina ?? null,
  };
}

export async function listPecas(): Promise<Peca[]> {
  const payload = await apiFetch(BASE_URL);
  return unwrapArray<RawPeca>(payload).map(normalizePeca);
}

export async function getPeca(id: number): Promise<Peca | null> {
  const payload = await apiFetch(`${BASE_URL}/${id}`);
  const peca = unwrapData<RawPeca>(payload);
  return peca ? normalizePeca(peca) : null;
}

export async function createPeca(peca: Partial<Peca>): Promise<ApiResponse<Peca>> {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(peca),
  });
}

export async function updatePeca(
  id: number,
  peca: Partial<Peca>
): Promise<ApiResponse<Peca>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(peca),
  });
}

export async function deletePeca(id: number): Promise<ApiResponse<null>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}
