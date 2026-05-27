"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { downloadVehicleReport } from "@/services/relatorios";
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

export function ClienteRelatoriosSection() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

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

  async function handleDownload(veiculoId: number) {
    try {
      setDownloadingId(veiculoId);
      setFeedback(null);
      setError(null);
      await downloadVehicleReport(veiculoId);
      setFeedback("Download do relatorio iniciado com sucesso.");
    } catch (currentError) {
      setError(getErrorMessage(currentError, "Nao foi possivel baixar o relatorio em PDF."));
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Veiculos aptos"
          value={loading ? "--" : String(veiculos.length)}
          helper="Itens com relatorio disponivel"
        />
        <StatCard
          title="Downloads em fila"
          value={downloadingId ? "1" : "0"}
          helper="Solicitacoes iniciadas nesta sessao"
        />
        <StatCard
          title="Portal de historico"
          value="PDF"
          helper="Arquivo gerado diretamente pela API"
        />
      </section>

      <section className="app-card space-y-4">
        <SectionHeader
          title="Relatorios"
          description="Selecione um veiculo para baixar o PDF do historico diretamente no seu dispositivo."
        />

        {feedback && (
          <div className="feedback-info">
            {feedback}
          </div>
        )}

        {error && (
          <div className="feedback-danger">
            {error}
          </div>
        )}

        {loading ? (
          <div className="feedback-info">
            Carregando veiculos para emissao dos relatorios...
          </div>
        ) : veiculos.length === 0 ? (
          <div className="surface-muted text-sm text-slate-500">
            Nenhum veiculo encontrado para gerar relatorio.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {veiculos.map((veiculo) => {
              const status = resolveVehicleStatusValue(veiculo);

              return (
                <article
                  key={veiculo.Id}
                  className="app-subcard"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
                        Veiculo #{veiculo.Id}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">
                        {veiculo.NomeVeiculo || "Sem nome"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {veiculo.PlacaVeiculo || "Placa nao informada"} •{" "}
                        {veiculo.TipoVeiculo || "Tipo nao informado"}
                      </p>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(status)}`}>
                      {resolveVehicleStatusLabel(status)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <p>Quilometragem: {veiculo.Quilometragem.toLocaleString("pt-BR")} km</p>
                    <p>Combustivel: {veiculo.Combustivel || "Nao informado"}</p>
                    <p>Cor: {veiculo.Cor || "Nao informada"}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload(veiculo.Id)}
                    disabled={downloadingId === veiculo.Id}
                    className="button-success mt-5 w-full disabled:opacity-70"
                  >
                    {downloadingId === veiculo.Id
                      ? "Baixando relatorio..."
                      : "Baixar relatorio PDF"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

