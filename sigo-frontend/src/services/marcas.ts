import { ApiResponse, Marca } from "@/types/entities";
import { buildBackendUrl } from "@/lib/config";
import { apiFetch } from "./api-client";
import { unwrapArray, unwrapData } from "./service-utils";

const BASE_URL = buildBackendUrl("Marca");

type RawMarca = Partial<Marca> & {
  id?: number;
  nome?: string;
  desc?: string;
  tipoMarca?: string;
};

function normalizeMarca(marca: RawMarca): Marca {
  return {
    Id: marca.Id ?? marca.id ?? 0,
    Nome: marca.Nome ?? marca.nome ?? "",
    Desc: marca.Desc ?? marca.desc ?? "",
    TipoMarca: marca.TipoMarca ?? marca.tipoMarca ?? "",
  };
}

export async function listMarcas(): Promise<Marca[]> {
  const payload = await apiFetch(BASE_URL);
  return unwrapArray<RawMarca>(payload).map(normalizeMarca);
}

export async function getMarca(id: number): Promise<Marca | null> {
  const payload = await apiFetch(`${BASE_URL}/id/${id}`);
  const marca = unwrapData<RawMarca>(payload);
  return marca ? normalizeMarca(marca) : null;
}

export async function createMarca(
  marca: Partial<Marca>
): Promise<ApiResponse<Marca>> {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(marca),
  });
}

export async function updateMarca(
  id: number,
  marca: Partial<Marca>
): Promise<ApiResponse<Marca>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(marca),
  });
}

export async function deleteMarca(id: number): Promise<ApiResponse<null>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function searchMarcaByNome(nome: string): Promise<Marca[]> {
  const payload = await apiFetch(`${BASE_URL}/name/${encodeURIComponent(nome)}`);
  return unwrapArray<RawMarca>(payload).map(normalizeMarca);
}
