"use client";

import { useEffect, useMemo, useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { situacaoOptions, statusVeiculoOptions } from "@/lib/constants";
import { Cliente, Funcionario, Peca, Pedido, Servico, Veiculo } from "@/types/entities";
import { getUserFromToken } from "@/services/auth";
import { listClientes } from "@/services/clientes";
import { listFuncionarios } from "@/services/funcionarios";
import { listPedidos } from "@/services/pedidos";
import { listPecas } from "@/services/pecas";
import { listServicos } from "@/services/servicos";
import { listVeiculos } from "@/services/veiculos";

interface MetricsState {
  clientes: Cliente[];
  funcionarios: Funcionario[];
  pedidos: Pedido[];
  pecas: Peca[];
  servicos: Servico[];
  veiculos: Veiculo[];
}

const initialState: MetricsState = {
  clientes: [],
  funcionarios: [],
  pedidos: [],
  pecas: [],
  servicos: [],
  veiculos: [],
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function resolveSituacao(value: number) {
  return situacaoOptions.find((item) => item.value === value)?.label ?? "-";
}

function resolveStatusVeiculo(value?: number | null) {
  return statusVeiculoOptions.find((item) => item.value === value)?.label ?? "-";
}

export function OverviewSection() {
  const [data, setData] = useState<MetricsState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const user = getUserFromToken();
        const canLoadPedidos = user?.role === "Admin" || user?.role === "Oficina";
        const [
          clientesList,
          funcionariosList,
          pedidosList,
          pecasList,
          servicosList,
          veiculosList,
        ] =
          await Promise.all([
            listClientes(),
            listFuncionarios(),
            canLoadPedidos ? listPedidos() : Promise.resolve([]),
            listPecas(),
            listServicos(),
            listVeiculos(),
          ]);

        setData({
          clientes: clientesList,
          funcionarios: funcionariosList,
          pedidos: pedidosList,
          pecas: pecasList,
          servicos: servicosList,
          veiculos: veiculosList,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Nao foi possivel carregar os indicadores."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const faturamentoEstimado = useMemo(
    () => data.servicos.reduce((acc, item) => acc + (item.Valor ?? 0), 0),
    [data.servicos]
  );

  const clientesAtivos = useMemo(
    () => data.clientes.filter((cliente) => cliente.Situacao === 1).length,
    [data.clientes]
  );

  const equipeAtiva = useMemo(
    () => data.funcionarios.filter((funcionario) => funcionario.Situacao === 1).length,
    [data.funcionarios]
  );

  const statusSummary = useMemo(() => {
    const summary = {
      pendente: 0,
      aguardando: 0,
      andamento: 0,
      concluido: 0,
    };

    data.veiculos.forEach((veiculo) => {
      const status = veiculo.Status ?? veiculo.Situacao ?? 0;

      if (status === 3) {
        summary.concluido += 1;
      } else if (status === 2) {
        summary.andamento += 1;
      } else if (status === 1) {
        summary.aguardando += 1;
      } else {
        summary.pendente += 1;
      }
    });

    return summary;
  }, [data.veiculos]);

  const veiculosEmFluxo = statusSummary.aguardando + statusSummary.andamento;
  const ticketMedio = data.servicos.length > 0 ? faturamentoEstimado / data.servicos.length : 0;
  const statusBase = Math.max(data.veiculos.length, 1);
  const estoquePecas = useMemo(
    () => data.pecas.reduce((acc, peca) => acc + (peca.Quantidade ?? 0), 0),
    [data.pecas]
  );
  const pedidosCatalogados = data.pedidos.length;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Clientes ativos"
          value={loading ? "--" : String(clientesAtivos)}
          helper="Base com situacao ativa e pronta para atendimento"
          trend={{ value: `${data.clientes.length}`, label: "cadastros totais", positive: true }}
        />
        <StatCard
          title="Equipe disponivel"
          value={loading ? "--" : String(equipeAtiva)}
          helper="Colaboradores em operacao no sistema"
          trend={{
            value: `${data.funcionarios.length}`,
            label: "pessoas cadastradas",
            positive: true,
          }}
        />
        <StatCard
          title="Servicos ativos"
          value={loading ? "--" : String(data.servicos.length)}
          helper="Catalogo operacional para uso imediato"
        />
        <StatCard
          title="Pedidos"
          value={loading ? "--" : String(pedidosCatalogados)}
          helper="Ordens de servico registradas"
        />
        <StatCard
          title="Pecas em estoque"
          value={loading ? "--" : String(estoquePecas)}
          helper="Quantidade total cadastrada"
        />
        <StatCard
          title="Receita catalogada"
          value={loading ? "--" : formatCurrency(faturamentoEstimado)}
          helper="Somatorio do valor base dos servicos cadastrados"
        />
      </section>

      {error && <div className="feedback-danger">{error}</div>}

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="app-card overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-normal text-blue-600">
                Visao executiva
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">
                Operacao distribuida por atendimento, cadastro e capacidade da equipe
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Use esta leitura rapida para entender o ritmo da oficina, identificar gargalos
                e perceber como o fluxo de veiculos esta se espalhando pelos modulos.
              </p>
            </div>

            <div className="rounded-[16px] border border-blue-100 bg-blue-50/80 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-normal text-blue-600">
                Em fluxo
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
                {loading ? "--" : String(veiculosEmFluxo)}
              </p>
              <p className="mt-1 text-sm text-slate-500">veiculos em acompanhamento no momento</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Pendentes",
                value: statusSummary.pendente,
                color: "bg-slate-500",
              },
              {
                label: "Aguardando",
                value: statusSummary.aguardando,
                color: "bg-amber-500",
              },
              {
                label: "Em andamento",
                value: statusSummary.andamento,
                color: "bg-blue-600",
              },
              {
                label: "Concluidos",
                value: statusSummary.concluido,
                color: "bg-emerald-500",
              },
            ].map((item) => {
              const percentage = `${Math.round((item.value / statusBase) * 100)}%`;

              return (
                <div key={item.label} className="app-subcard">
                  <div className="flex items-center justify-between gap-3">
                    <p className="metric-kicker">{item.label}</p>
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  </div>
                  <p className="mt-4 text-3xl font-semibold tracking-normal text-slate-950">
                    {loading ? "--" : String(item.value)}
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: loading ? "32%" : percentage }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{loading ? "--" : percentage} da base atual</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="app-card">
            <p className="text-[11px] font-semibold uppercase tracking-normal text-blue-600">
              Indicadores de operacao
            </p>
            <div className="mt-5 space-y-4">
              {[
                {
                  label: "Ticket medio estimado",
                  value: loading ? "--" : formatCurrency(ticketMedio),
                },
                {
                  label: "Veiculos cadastrados",
                  value: loading ? "--" : String(data.veiculos.length),
                },
                {
                  label: "Catalogo por colaborador",
                  value:
                    loading || data.funcionarios.length === 0
                      ? "--"
                      : `${(data.servicos.length / data.funcionarios.length).toFixed(1)} servicos`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-[14px] border border-slate-200 bg-slate-50/80 px-4 py-3"
                >
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="app-card bg-[linear-gradient(135deg,#0f172a,#172554,#1d4ed8)] text-white">
            <p className="text-[11px] font-semibold uppercase tracking-normal text-blue-100/78">
              Resumo rapido
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-normal">
              {loading ? "--" : String(veiculosEmFluxo)} veiculos exigem acompanhamento proximo
            </p>
            <p className="mt-3 text-sm leading-6 text-blue-50/74">
              Combine esse numero com o quadro de clientes e o valor do catalogo para priorizar atendimento, capacidade e planejamento.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Clientes recentes"
          description="Resumo dos ultimos cadastros e da situacao atual da base."
        />
        <DataTable
          data={loading ? [] : data.clientes.slice(0, 5)}
          columns={[
            { header: "Nome", key: "Nome" },
            { header: "E-mail", key: "Email" },
            { header: "Cidade", key: "Cidade" },
            { header: "Estado", key: "Estado", width: "80px" },
            {
              header: "Situacao",
              key: "Situacao",
              render: (item) => (
                <span className={`badge ${item.Situacao === 1 ? "badge-success" : "badge-warning"}`}>
                  {resolveSituacao(item.Situacao)}
                </span>
              ),
            },
          ]}
          emptyMessage={loading ? "Carregando clientes..." : "Nenhum cliente cadastrado"}
          getRowId={(cliente) => cliente.Id}
        />
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Veiculos em atendimento"
          description="Leitura operacional dos veiculos cadastrados e do status atual de acompanhamento."
        />
        <DataTable
          data={loading ? [] : data.veiculos.slice(0, 6)}
          columns={[
            { header: "Veiculo", key: "NomeVeiculo" },
            { header: "Placa", key: "PlacaVeiculo", width: "120px" },
            { header: "Combustivel", key: "Combustivel" },
            {
              header: "Situacao",
              key: "Situacao",
              render: (item) => (
                <span
                  className={`badge ${
                    (item.Status ?? item.Situacao ?? 0) === 3 ? "badge-success" : "badge-warning"
                  }`}
                >
                  {resolveStatusVeiculo(item.Status ?? item.Situacao)}
                </span>
              ),
            },
          ]}
          emptyMessage={loading ? "Carregando veiculos..." : "Nenhum veiculo encontrado"}
          getRowId={(veiculo) => veiculo.Id}
        />
      </section>
    </div>
  );
}
