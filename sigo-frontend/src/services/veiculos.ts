import { ApiResponse, Veiculo } from "@/types/entities";
import { buildBackendUrl } from "@/lib/config";
import { apiFetch } from "./api-client";
import { unwrapArray } from "./service-utils";

const BASE_URL = buildBackendUrl("Veiculo");

type RawVeiculo = Partial<Veiculo> & {
  id?: number;
  nomeVeiculo?: string;
  tipoVeiculo?: string;
  placaVeiculo?: string;
  chassiVeiculo?: string;
  anoFab?: number;
  quilometragem?: number;
  combustivel?: string;
  seguro?: string;
  cor?: string;
  clienteId?: number;
  corId?: number;
  status?: number;
  situacao?: number;
};

function normalizeVeiculo(veiculo: RawVeiculo): Veiculo {
  return {
    Id: veiculo.Id ?? veiculo.id ?? 0,
    NomeVeiculo: veiculo.NomeVeiculo ?? veiculo.nomeVeiculo ?? "",
    TipoVeiculo: veiculo.TipoVeiculo ?? veiculo.tipoVeiculo ?? "",
    PlacaVeiculo: veiculo.PlacaVeiculo ?? veiculo.placaVeiculo ?? "",
    ChassiVeiculo: veiculo.ChassiVeiculo ?? veiculo.chassiVeiculo ?? "",
    AnoFab: veiculo.AnoFab ?? veiculo.anoFab ?? 0,
    Quilometragem: veiculo.Quilometragem ?? veiculo.quilometragem ?? 0,
    Combustivel: veiculo.Combustivel ?? veiculo.combustivel ?? "",
    Seguro: veiculo.Seguro ?? veiculo.seguro ?? "",
    Cor: veiculo.Cor ?? veiculo.cor ?? "",
    ClienteId: veiculo.ClienteId ?? veiculo.clienteId ?? 0,
    CorId: veiculo.CorId ?? veiculo.corId ?? 0,
    Status: veiculo.Status ?? veiculo.status ?? veiculo.Situacao ?? veiculo.situacao ?? 0,
    Situacao: veiculo.Situacao ?? veiculo.situacao ?? veiculo.Status ?? veiculo.status ?? 0,
  };
}

export async function listVeiculos(): Promise<Veiculo[]> {
  const payload = await apiFetch(BASE_URL);
  return unwrapArray<RawVeiculo>(payload).map(normalizeVeiculo);
}

export async function createVeiculo(
  veiculo: Partial<Veiculo>
): Promise<ApiResponse<Veiculo>> {
  return apiFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(veiculo),
  });
}

export async function updateVeiculo(
  id: number,
  veiculo: Partial<Veiculo>
): Promise<ApiResponse<Veiculo>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(veiculo),
  });
}

export async function deleteVeiculo(id: number): Promise<ApiResponse<null>> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function searchVeiculoByPlaca(placa: string): Promise<Veiculo[]> {
  const payload = await apiFetch(`${BASE_URL}/placa/${encodeURIComponent(placa)}`);
  return unwrapArray<RawVeiculo>(payload).map(normalizeVeiculo);
}

export async function searchVeiculoByTipo(tipo: string): Promise<Veiculo[]> {
  const payload = await apiFetch(`${BASE_URL}/tipo/${encodeURIComponent(tipo)}`);
  return unwrapArray<RawVeiculo>(payload).map(normalizeVeiculo);
}
