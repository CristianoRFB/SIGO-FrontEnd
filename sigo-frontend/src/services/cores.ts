import { ApiResponse, Cor } from "@/types/entities";
import { apiFetch } from "./api-client";
import { buildBackendUrl } from "@/lib/config";

const BASE_URL = buildBackendUrl("Cor");

type RawCor = Record<string, unknown>;

function normalizeCor(value: RawCor): Cor {
  return {
    Id: Number(value.Id ?? value.id ?? 0),
    NomeCor: String(value.NomeCor ?? value.nomeCor ?? ""),
  };
}

function normalizeCorList(payload: unknown): Cor[] {
  const rawData = isApiResponse(payload) ? payload.data : payload;

  if (!rawData) {
    return [];
  }

  const items = Array.isArray(rawData) ? rawData : [rawData];
  return items
    .filter((item): item is RawCor => !!item && typeof item === "object")
    .map(normalizeCor);
}

export async function listCores(): Promise<Cor[]> {
  const payload = await apiFetch(BASE_URL);
  return normalizeCorList(payload);
}

export async function createCor(cor: Partial<Cor>): Promise<ApiResponse<Cor>> {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(cor),
  }) as Promise<ApiResponse<Cor>>;
}

export async function updateCor(id: number, cor: Partial<Cor>): Promise<ApiResponse<Cor>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(cor),
  }) as Promise<ApiResponse<Cor>>;
}

export async function deleteCor(id: number): Promise<ApiResponse<null>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  }) as Promise<ApiResponse<null>>;
}

export async function searchCorByNome(nome: string): Promise<Cor[]> {
  const payload = await apiFetch(`${BASE_URL}/name/${encodeURIComponent(nome)}`);
  return normalizeCorList(payload);
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return !!value && typeof value === "object" && "code" in value && "data" in value;
}
