"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency, formatDate } from "@/lib/portal-formatters";
import { getErrorMessage } from "@/services/errors";
import { listMyPedidoServices } from "@/services/pedidos";
import type { Servico } from "@/types/entities";

export function ClienteServicosSection() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setServicos(await listMyPedidoServices());
      } catch (currentError) {
        setError(getErrorMessage(currentError, "Nao foi possivel carregar seus servicos."));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredServicos = useMemo(() => {
    if (!search.trim()) {
      return servicos;
    }

    const term = search.toLowerCase();

    return servicos.filter((servico) =>
      [servico.Nome, servico.Descricao]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [search, servicos]);

  const totalEstimado = useMemo(
    () => servicos.reduce((accumulator, servico) => accumulator + servico.Valor, 0),
    [servicos]
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Servicos encontrados"
          value={loading ? "--" : String(servicos.length)}
          helper="Itens vinculados aos seus pedidos"
        />
        <StatCard
          title="Valor estimado"
          value={loading ? "--" : formatCurrency(totalEstimado)}
          helper="Soma dos servicos listados no seu historico"
        />
      </section>

      <section className="app-card space-y-4">
        <SectionHeader
          title="Servicos realizados"
          description="Consulte os servicos retornados pelo endpoint do proprio cliente."
          actionSlot={
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou descricao"
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
          data={filteredServicos}
          columns={[
            { header: "Servico", key: "Nome" },
            {
              header: "Descricao",
              key: "Descricao",
              render: (servico: Servico) => servico.Descricao || "Sem descricao",
            },
            {
              header: "Valor",
              key: "Valor",
              render: (servico: Servico) => formatCurrency(servico.Valor),
              width: "130px",
            },
            {
              header: "Garantia",
              key: "Garantia",
              render: (servico: Servico) => formatDate(servico.Garantia),
              width: "130px",
            },
          ]}
          emptyMessage={loading ? "Carregando servicos..." : "Nenhum servico encontrado"}
          getRowId={(servico) => servico.Id}
        />
      </section>
    </div>
  );
}

