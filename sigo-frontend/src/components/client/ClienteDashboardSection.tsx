"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { getUserFromToken } from "@/services/auth";
import { getErrorMessage } from "@/services/errors";
import { listPedidos, listMyPedidoServices } from "@/services/pedidos";
import { listVeiculos } from "@/services/veiculos";
import {
  formatCurrency,
  formatDate,
  getVehicleLabel,
  resolvePedidoStatusValue,
  resolveVehicleStatusLabel,
  resolveVehicleStatusValue,
} from "@/lib/portal-formatters";
import type { AuthUser, Pedido, Servico, Veiculo } from "@/types/entities";

interface DashboardState {
  veiculos: Veiculo[];
  pedidos: Pedido[];
  servicos: Servico[];
}

const initialState: DashboardState = {
  veiculos: [],
  pedidos: [],
  servicos: [],
};

function getStatusBadgeClass(status: number | null) {
  if (status === 3) {
    return "badge-success";
  }

  if (status === 2) {
    return "badge-warning";
  }

  return "badge";
}

function sortPedidosByDate(pedidos: Pedido[]) {
  return [...pedidos].sort((first, second) => second.DataInicio.localeCompare(first.DataInicio));
}

export function ClienteDashboardSection() {
  const [data, setData] = useState<DashboardState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setAuthUser(getUserFromToken());

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [veiculos, pedidos, servicos] = await Promise.all([
          listVeiculos(),
          listPedidos(),
          listMyPedidoServices(),
        ]);

        setData({ veiculos, pedidos, servicos });
      } catch (currentError) {
        setError(
          getErrorMessage(
            currentError,
            "Nao foi possivel carregar o resumo do seu portal."
          )
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const veiculosById = useMemo(
    () => new Map(data.veiculos.map((veiculo) => [veiculo.Id, veiculo])),
    [data.veiculos]
  );

  const servicosById = useMemo(
    () => new Map(data.servicos.map((servico) => [servico.Id, servico])),
    [data.servicos]
  );

  const pedidosOrdenados = useMemo(() => sortPedidosByDate(data.pedidos), [data.pedidos]);

  const pedidosFinalizados = useMemo(
    () =>
      data.pedidos.filter((pedido) => {
        const veiculo = veiculosById.get(pedido.idVeiculo);
        return resolvePedidoStatusValue(pedido, veiculo) === 3;
      }).length,
    [data.pedidos, veiculosById]
  );

  const pedidosEmAndamento = Math.max(data.pedidos.length - pedidosFinalizados, 0);

  const veiculosAtivos = useMemo(
    () =>
      data.veiculos.filter((veiculo) => resolveVehicleStatusValue(veiculo) === 2).length,
    [data.veiculos]
  );

  const ultimoServico = useMemo(() => {
    for (const pedido of pedidosOrdenados) {
      for (const servico of pedido.Pedido_Servicos) {
        const nome = servicosById.get(servico.IdServico)?.Nome;

        if (nome) {
          return nome;
        }
      }
    }

    return data.servicos[0]?.Nome ?? "Sem servicos registrados";
  }, [data.servicos, pedidosOrdenados, servicosById]);

  const ultimoPedido = pedidosOrdenados[0] ?? null;
  const ultimoVeiculo = data.veiculos[0] ?? null;
  const ticketMedio =
    data.pedidos.length > 0
      ? data.pedidos.reduce((accumulator, pedido) => accumulator + pedido.ValorTotal, 0) /
        data.pedidos.length
      : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <article className="app-card relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#1d4ed8,#60a5fa)]" />
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-normal text-blue-600">
                Portal do cliente
              </p>
              <div>
                <h2 className="text-3xl font-semibold tracking-normal text-slate-950">
                  {authUser ? `Ola, ${authUser.name}.` : "Acompanhe seu veiculo com clareza."}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Visualize pedidos, acompanhe servicos em andamento e consulte o
                  historico do seu veiculo em uma area centralizada e organizada.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="surface-highlight">
                  <p className="metric-kicker">Pedidos ativos</p>
                  <p className="metric-value mt-2">{loading ? "--" : pedidosEmAndamento}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Ordens abertas para acompanhamento.
                  </p>
                </div>
                <div className="app-subcard">
                  <p className="metric-kicker">Veiculos monitorados</p>
                  <p className="metric-value mt-2">{loading ? "--" : data.veiculos.length}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Cadastro vinculado ao seu perfil.
                  </p>
                </div>
                <div className="app-subcard">
                  <p className="metric-kicker">Ticket medio</p>
                  <p className="metric-value mt-2">
                    {loading ? "--" : formatCurrency(ticketMedio)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Valor medio dos pedidos registrados.
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-muted space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
                  Situacao atual
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">
                  {ultimoVeiculo?.NomeVeiculo || "Nenhum veiculo encontrado"}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {ultimoVeiculo
                    ? `${ultimoVeiculo.PlacaVeiculo || "Sem placa"} - ${ultimoVeiculo.TipoVeiculo || "Tipo nao informado"}`
                    : "Cadastre ou consulte os veiculos vinculados ao seu acesso."}
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[14px] border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-normal text-slate-500">
                    Ultimo servico
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{ultimoServico}</p>
                </div>
                <div className="rounded-[14px] border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-normal text-slate-500">
                    Ultimo pedido
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {ultimoPedido
                      ? `#${ultimoPedido.Id} iniciado em ${formatDate(ultimoPedido.DataInicio)}`
                      : "Nenhum pedido registrado"}
                  </p>
                </div>
                <div className="rounded-[14px] border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-normal text-slate-500">
                    Veiculos em manutencao
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {loading ? "--" : `${veiculosAtivos} item(ns) com atividade em aberto`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <StatCard
            title="Total de veiculos"
            value={loading ? "--" : String(data.veiculos.length)}
            helper="Veiculos vinculados a sua conta"
          />
          <StatCard
            title="Pedidos finalizados"
            value={loading ? "--" : String(pedidosFinalizados)}
            helper="Historico concluido no sistema"
          />
          <StatCard
            title="Ultimo servico"
            value={loading ? "--" : ultimoServico}
            helper="Servico mais recente registrado"
          />
        </div>
      </section>

      {error && <div className="feedback-danger">{error}</div>}

      <section className="grid gap-6 2xl:grid-cols-[1.1fr_1fr]">
        <article className="app-card space-y-4">
          <SectionHeader
            title="Veiculos recentes"
            description="Uma visao curta dos veiculos mais recentes ou com informacoes ativas no seu cadastro."
          />
          <DataTable
            data={loading ? [] : data.veiculos.slice(0, 4)}
            columns={[
              {
                header: "Veiculo",
                key: "NomeVeiculo",
                render: (veiculo: Veiculo) => (
                  <div>
                    <p className="font-medium text-slate-900">
                      {veiculo.NomeVeiculo || "Sem nome"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {veiculo.TipoVeiculo || "Tipo nao informado"}
                    </p>
                  </div>
                ),
              },
              { header: "Placa", key: "PlacaVeiculo", width: "140px" },
              {
                header: "Quilometragem",
                key: "Quilometragem",
                render: (veiculo: Veiculo) =>
                  `${veiculo.Quilometragem.toLocaleString("pt-BR")} km`,
              },
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
        </article>

        <article className="app-card space-y-4">
          <SectionHeader
            title="Pedidos recentes"
            description="Resumo dos pedidos mais recentes vinculados aos seus veiculos."
          />
          <DataTable
            data={loading ? [] : pedidosOrdenados.slice(0, 5)}
            columns={[
              {
                header: "Pedido",
                key: "Id",
                render: (pedido: Pedido) => `#${pedido.Id}`,
                width: "100px",
              },
              {
                header: "Veiculo",
                key: "idVeiculo",
                render: (pedido: Pedido) => getVehicleLabel(veiculosById.get(pedido.idVeiculo)),
              },
              {
                header: "Inicio",
                key: "DataInicio",
                render: (pedido: Pedido) => formatDate(pedido.DataInicio),
                width: "130px",
              },
              {
                header: "Status",
                key: "status",
                render: (pedido: Pedido) => {
                  const status = resolvePedidoStatusValue(
                    pedido,
                    veiculosById.get(pedido.idVeiculo)
                  );

                  return (
                    <span className={`badge ${getStatusBadgeClass(status)}`}>
                      {resolveVehicleStatusLabel(status)}
                    </span>
                  );
                },
              },
              {
                header: "Valor total",
                key: "ValorTotal",
                render: (pedido: Pedido) => formatCurrency(pedido.ValorTotal),
              },
            ]}
            emptyMessage={loading ? "Carregando pedidos..." : "Nenhum pedido encontrado"}
            getRowId={(pedido) => pedido.Id}
          />
        </article>
      </section>
    </div>
  );
}
