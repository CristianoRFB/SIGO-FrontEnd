import { ApiResponse, Veiculo } from "@/types/entities";
import { apiFetch } from "./api-client";
import { BACKEND_API_BASE_URL } from "@/lib/config";

const BASE_URL = `${BACKEND_API_BASE_URL}/Veiculo`;

// Lista todos os veículos
export async function listVeiculos(): Promise<Veiculo[]> {
  const payload = await apiFetch(BASE_URL);
  return normalize(payload?.data);
}

// Cria um novo veículo
export async function createVeiculo(veiculo: Partial<Veiculo>): Promise<ApiResponse<Veiculo>> {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(veiculo),
  });
}

// Atualiza um veículo existente
export async function updateVeiculo(id: number, veiculo: Partial<Veiculo>): Promise<ApiResponse<Veiculo>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(veiculo),
  });
}

// Deleta um veículo pelo ID
export async function deleteVeiculo(id: number): Promise<ApiResponse<null>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

// Busca veículos pela placa
export async function searchVeiculoByPlaca(placa: string): Promise<Veiculo[]> {
  const payload = await apiFetch(`${BASE_URL}/placa/${encodeURIComponent(placa)}`);
  return normalize(payload?.data);
}

// Busca veículos pelo tipo
export async function searchVeiculoByTipo(tipo: string): Promise<Veiculo[]> {
  const payload = await apiFetch(`${BASE_URL}/tipo/${encodeURIComponent(tipo)}`);
  return normalize(payload?.data);
}

// Normaliza data para sempre retornar array
function normalize(data: Veiculo[] | Veiculo | null | undefined): Veiculo[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}