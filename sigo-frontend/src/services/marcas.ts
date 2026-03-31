import { ApiResponse, Marca } from "@/types/entities";
import { apiFetch } from "./api-client";
import { BACKEND_API_BASE_URL } from "@/lib/config";

const BASE_URL = `${BACKEND_API_BASE_URL}/Marca`;

// Lista todas as marcas
export async function listMarcas(): Promise<Marca[]> {
  const payload = await apiFetch(BASE_URL);
  return normalize(payload?.data);
}

// Busca marca por ID
export async function getMarca(id: number): Promise<Marca | null> {
  const payload = await apiFetch(`${BASE_URL}/${id}`);
  return payload?.data ?? payload ?? null;
}

// Cria uma nova marca
export async function createMarca(marca: Partial<Marca>): Promise<ApiResponse<Marca>> {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(marca),
  });
}

// Atualiza uma marca existente
export async function updateMarca(id: number, marca: Partial<Marca>): Promise<ApiResponse<Marca>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(marca),
  });
}

// Deleta uma marca pelo ID
export async function deleteMarca(id: number): Promise<ApiResponse<null>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

// Busca marcas pelo nome
export async function searchMarcaByNome(nome: string): Promise<Marca[]> {
  const payload = await apiFetch(`${BASE_URL}/nome/${encodeURIComponent(nome)}`);
  return normalize(payload?.data);
}

// Normaliza data para sempre retornar um array
function normalize(data: Marca[] | Marca | null | undefined): Marca[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}