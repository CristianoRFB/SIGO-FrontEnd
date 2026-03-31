import { ApiResponse, Cor } from "@/types/entities";
import { apiFetch } from "./api-client";
import { BACKEND_API_BASE_URL } from "@/lib/config";

const BASE_URL = `${BACKEND_API_BASE_URL}/Cor`;

// Lista todas as cores
export async function listCores(): Promise<Cor[]> {
  const payload = await apiFetch(BASE_URL);
  return normalize(payload?.data);
}

// Cria uma nova cor
export async function createCor(cor: Partial<Cor>): Promise<ApiResponse<Cor>> {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(cor),
  });
}

// Atualiza uma cor existente
export async function updateCor(id: number, cor: Partial<Cor>): Promise<ApiResponse<Cor>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(cor),
  });
}

// Deleta uma cor pelo ID
export async function deleteCor(id: number): Promise<ApiResponse<null>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

// Busca cores pelo nome
export async function searchCorByNome(nome: string): Promise<Cor[]> {
  const payload = await apiFetch(`${BASE_URL}/nome/${encodeURIComponent(nome)}`);
  return normalize(payload?.data);
}

// Normaliza data para sempre retornar array
function normalize(data: Cor[] | Cor | null | undefined): Cor[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}