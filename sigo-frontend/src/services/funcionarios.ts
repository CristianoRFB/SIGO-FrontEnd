import { ApiResponse, Funcionario } from "@/types/entities";
import { apiFetch } from "./api-client";
import { BACKEND_API_BASE_URL } from "@/lib/config";

const BASE_URL = `${BACKEND_API_BASE_URL}/Funcionario`;

// Lista todos os funcionários
export async function listFuncionarios(): Promise<Funcionario[]> {
  const payload = await apiFetch(BASE_URL);
  return normalize(payload?.data);
}

// Busca funcionário por ID
export async function getFuncionario(id: number): Promise<Funcionario | null> {
  const payload = await apiFetch(`${BASE_URL}/${id}`);
  return payload?.data ?? payload ?? null;
}

// Cria um novo funcionário
export async function createFuncionario(funcionario: Partial<Funcionario>): Promise<ApiResponse<Funcionario>> {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(funcionario),
  });
}

// Atualiza um funcionário existente
export async function updateFuncionario(id: number, funcionario: Partial<Funcionario>): Promise<ApiResponse<Funcionario>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(funcionario),
  });
}

// Deleta um funcionário pelo ID
export async function deleteFuncionario(id: number): Promise<ApiResponse<null>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

// Busca funcionário pelo nome
export async function searchFuncionarioByNome(nome: string): Promise<Funcionario[]> {
  const payload = await apiFetch(`${BASE_URL}/nome/${encodeURIComponent(nome)}`);
  return normalize(payload?.data);
}

// Normaliza data para sempre retornar um array
function normalize(data: Funcionario[] | Funcionario | null | undefined): Funcionario[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}