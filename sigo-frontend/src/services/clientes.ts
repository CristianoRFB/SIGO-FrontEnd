import { ApiResponse, Cliente } from "@/types/entities";
import { buildBackendUrl } from "@/lib/config";
import { apiFetch } from "./api-client";
import { unwrapArray, unwrapData } from "./service-utils";

const BASE_URL = buildBackendUrl("Cliente");

type RawCliente = Partial<Cliente> & {
  id?: number;
  nome?: string;
  email?: string;
  cpf_Cnpj?: string;
  cpf_CNPJ?: string;
  obs?: string;
  dataNasc?: string;
  numero?: number;
  rua?: string;
  cidade?: string;
  cep?: string | number;
  bairro?: string;
  estado?: string;
  pais?: string;
  complemento?: string;
  sexo?: number;
  tipoCliente?: number;
  situacao?: number;
  telefones?: Cliente["Telefones"];
  veiculos?: Cliente["Veiculos"];
};

function normalizeCliente(cliente: RawCliente): Cliente {
  return {
    Id: cliente.Id ?? cliente.id ?? 0,
    Nome: cliente.Nome ?? cliente.nome ?? "",
    Email: cliente.Email ?? cliente.email ?? "",
    senha: cliente.senha ?? "",
    Cpf_Cnpj: cliente.Cpf_Cnpj ?? cliente.cpf_Cnpj ?? cliente.cpf_CNPJ ?? "",
    Obs: cliente.Obs ?? cliente.obs ?? "",
    razao: cliente.razao ?? "",
    DataNasc: cliente.DataNasc ?? cliente.dataNasc ?? "",
    Numero: cliente.Numero ?? cliente.numero ?? 0,
    Rua: cliente.Rua ?? cliente.rua ?? "",
    Cidade: cliente.Cidade ?? cliente.cidade ?? "",
    Cep: String(cliente.Cep ?? cliente.cep ?? ""),
    Bairro: cliente.Bairro ?? cliente.bairro ?? "",
    Estado: cliente.Estado ?? cliente.estado ?? "",
    Pais: cliente.Pais ?? cliente.pais ?? "",
    Complemento: cliente.Complemento ?? cliente.complemento ?? "",
    Sexo: cliente.Sexo ?? cliente.sexo ?? 1,
    TipoCliente: cliente.TipoCliente ?? cliente.tipoCliente ?? 1,
    Situacao: cliente.Situacao ?? cliente.situacao ?? 1,
    Telefones: cliente.Telefones ?? cliente.telefones ?? null,
    Veiculos: cliente.Veiculos ?? cliente.veiculos ?? null,
  };
}

export async function listClientes(): Promise<Cliente[]> {
  const payload = await apiFetch(BASE_URL);
  return unwrapArray<RawCliente>(payload).map(normalizeCliente);
}

export async function getCliente(id: number): Promise<Cliente | null> {
  const payload = await apiFetch(`${BASE_URL}/id/${id}`);
  const cliente = unwrapData<RawCliente>(payload);
  return cliente ? normalizeCliente(cliente) : null;
}

export async function createCliente(
  cliente: Partial<Cliente>
): Promise<ApiResponse<Cliente>> {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(cliente),
  });
}

export async function updateCliente(
  id: number,
  cliente: Partial<Cliente>
): Promise<ApiResponse<Cliente>> {
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
  const payload = await apiFetch(`${BASE_URL}/name/${encodeURIComponent(nome)}`);
  return unwrapArray<RawCliente>(payload).map(normalizeCliente);
}
