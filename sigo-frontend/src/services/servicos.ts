import { ApiResponse, Servico } from "@/types/entities";
import { apiFetch } from "./api-client";
import { BACKEND_API_BASE_URL } from "@/lib/config";

const BASE_URL = `${BACKEND_API_BASE_URL}/Servico`;

// Lista todos os serviços
export async function listServicos(): Promise<Servico[]> {
  const payload = await apiFetch(BASE_URL);
  return normalize(payload?.data);
}

// Busca serviço por ID
export async function getServico(id: number): Promise<Servico | null> {
  const payload = await apiFetch(`${BASE_URL}/${id}`);
  return payload?.data ?? payload ?? null;
}

// Cria um novo serviço
export async function createServico(servico: Partial<Servico>): Promise<ApiResponse<Servico>> {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(servico),
  });
}

// Atualiza um serviço existente
export async function updateServico(id: number, servico: Partial<Servico>): Promise<ApiResponse<Servico>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(servico),
  });
}

// Deleta um serviço pelo ID
export async function deleteServico(id: number): Promise<ApiResponse<null>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

// Busca serviços pelo nome
export async function searchServicoByNome(nome: string): Promise<Servico[]> {
  const payload = await apiFetch(`${BASE_URL}/nome/${encodeURIComponent(nome)}`);
  return normalize(payload?.data);
}

// Normaliza data para sempre retornar um array
function normalize(data: Servico[] | Servico | null | undefined): Servico[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}