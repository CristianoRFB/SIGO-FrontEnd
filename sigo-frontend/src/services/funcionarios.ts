import { ApiResponse, Funcionario } from "@/types/entities";
import { buildBackendUrl } from "@/lib/config";
import { apiFetch } from "./api-client";
import { unwrapArray, unwrapData } from "./service-utils";

const BASE_URL = buildBackendUrl("Funcionario");

type RawFuncionario = Partial<Funcionario> & {
  id?: number;
  nome?: string;
  cpf?: string;
  cargo?: string;
  senha?: string;
  email?: string;
  situacao?: number;
};

function normalizeFuncionario(funcionario: RawFuncionario): Funcionario {
  return {
    Id: funcionario.Id ?? funcionario.id ?? 0,
    Nome: funcionario.Nome ?? funcionario.nome ?? "",
    Cpf: funcionario.Cpf ?? funcionario.cpf ?? "",
    Cargo: funcionario.Cargo ?? funcionario.cargo ?? "",
    Senha: funcionario.Senha ?? funcionario.senha ?? "",
    Email: funcionario.Email ?? funcionario.email ?? "",
    Situacao: funcionario.Situacao ?? funcionario.situacao ?? 1,
  };
}

export async function listFuncionarios(): Promise<Funcionario[]> {
  const payload = await apiFetch(BASE_URL);
  return unwrapArray<RawFuncionario>(payload).map(normalizeFuncionario);
}

export async function getFuncionario(id: number): Promise<Funcionario | null> {
  const payload = await apiFetch(`${BASE_URL}/id/${id}`);
  const funcionario = unwrapData<RawFuncionario>(payload);
  return funcionario ? normalizeFuncionario(funcionario) : null;
}

export async function createFuncionario(
  funcionario: Partial<Funcionario>
): Promise<ApiResponse<Funcionario>> {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(funcionario),
  });
}

export async function updateFuncionario(
  id: number,
  funcionario: Partial<Funcionario>
): Promise<ApiResponse<Funcionario>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(funcionario),
  });
}

export async function deleteFuncionario(id: number): Promise<ApiResponse<null>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function searchFuncionarioByNome(
  nome: string
): Promise<Funcionario[]> {
  const payload = await apiFetch(`${BASE_URL}/name/${encodeURIComponent(nome)}`);
  return unwrapArray<RawFuncionario>(payload).map(normalizeFuncionario);
}
