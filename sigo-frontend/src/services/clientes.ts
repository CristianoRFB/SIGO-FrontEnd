import { ApiResponse, Cliente } from "@/types/entities";
import { apiFetch } from "./api-client";
import { BACKEND_API_BASE_URL } from "@/lib/config";

const BASE_URL = `${BACKEND_API_BASE_URL}/Cliente`;

export async function listClientes(): Promise<Cliente[]> {
  const payload = await apiFetch(`${BASE_URL}`);

  if (payload?.data) {
    return Array.isArray(payload.data) ? payload.data : [payload.data];
  }

  return [];
}

export async function getCliente(id: number): Promise<Cliente | null> {
  const payload = await apiFetch(`${BASE_URL}/${id}`);

  if (isApiResponse(payload)) {
    return payload.data ?? null;
  }

  return payload ?? null;
}

export async function createCliente(cliente: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(cliente),
  });
}

export async function updateCliente(id: number, cliente: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(cliente),
  });
}

export async function deleteCliente(id: number): Promise<ApiResponse<null>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function searchClienteByNome(nome: string): Promise<Cliente[]> {
  const payload = await apiFetch(`${BASE_URL}/nome/${encodeURIComponent(nome)}`);

  if (payload?.data) {
    return Array.isArray(payload.data) ? payload.data : [payload.data];
  }

  return [];
}

// Tipo guard simples
function isApiResponse(value: unknown): value is ApiResponse<any> {
  return !!value && typeof value === "object" && "Code" in value && "data" in value;
}