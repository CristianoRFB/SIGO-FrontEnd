"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getErrorMessage } from "@/services/errors";
import { listVeiculos } from "@/services/veiculos";
import {
  resolveVehicleStatusLabel,
  resolveVehicleStatusValue,
} from "@/lib/portal-formatters";
import type { Veiculo } from "@/types/entities";

function getStatusBadgeClass(status: number | null) {
  if (status === 3) {
    return "badge-success";
  }

  if (status === 2) {
    return "badge-warning";
  }

  return "badge";
}

export function ClienteVeiculosSection() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setVeiculos(await listVeiculos());
      } catch (currentError) {
        setError(getErrorMessage(currentError, "Nao foi possivel carregar seus veiculos."));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredVeiculos = useMemo(() => {
    if (!search.trim()) {
      return veiculos;
    }

    const term = search.toLowerCase();

    return veiculos.filter((veiculo) =>
      [
        veiculo.NomeVeiculo,
        veiculo.TipoVeiculo,
        veiculo.PlacaVeiculo,
        veiculo.Cor,
        veiculo.Combustivel,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [search, veiculos]);

  return (
    <div className="space-y-6">
      <section className="app-card space-y-4">
        <SectionHeader
          title="Meus veiculos"
          description="A lista abaixo mostra apenas os veiculos vinculados ao cliente autenticado."
          actionSlot={
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por placa, modelo ou combustivel"
              className="toolbar-search sm:w-80"
            />
          }
        />

        {error && (
          <div className="feedback-danger">
            {error}
          </div>
        )}

        <DataTable
          data={filteredVeiculos}
          columns={[
            {
              header: "Veiculo",
              key: "NomeVeiculo",
              render: (veiculo: Veiculo) => (
                <div>
                  <p className="font-medium text-slate-900">{veiculo.NomeVeiculo || "Sem nome"}</p>
                  <p className="text-xs text-slate-500">{veiculo.TipoVeiculo || "Tipo nao informado"}</p>
                </div>
              ),
            },
            { header: "Placa", key: "PlacaVeiculo", width: "130px" },
            { header: "Ano", key: "AnoFab", width: "90px" },
            {
              header: "Quilometragem",
              key: "Quilometragem",
              render: (veiculo: Veiculo) => `${veiculo.Quilometragem.toLocaleString("pt-BR")} km`,
            },
            { header: "Combustivel", key: "Combustivel" },
            { header: "Cor", key: "Cor" },
            {
              header: "Status",
              key: "Situacao",
              render: (veiculo: Veiculo) => {
                const status = resolveVehicleStatusValue(veiculo);
                return (
                  <span className={`badge ${getStatusBadgeClass(status)}`}>
                    {resolveVehicleStatusLabel(status)}
                  </span>
                );
              },
            },
          ]}
          emptyMessage={loading ? "Carregando veiculos..." : "Nenhum veiculo encontrado"}
          getRowId={(veiculo) => veiculo.Id}
        />
      </section>
    </div>
  );
}

