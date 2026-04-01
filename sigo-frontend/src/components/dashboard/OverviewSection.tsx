"use client";

import { useEffect, useMemo, useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { situacaoOptions, statusVeiculoOptions } from "@/lib/constants";
import { Cliente, Funcionario, Servico, Veiculo } from "@/types/entities";
import { listClientes } from "@/services/clientes";
import { listFuncionarios } from "@/services/funcionarios";
import { listServicos } from "@/services/servicos";
import { listVeiculos } from "@/services/veiculos";

interface MetricsState {
  clientes: Cliente[];
  funcionarios: Funcionario[];
  servicos: Servico[];
  veiculos: Veiculo[];
}

const initialState: MetricsState = {
  clientes: [],
  funcionarios: [],
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

function resolveStatusVeiculo(value: number) {
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

        const [clientesList, funcionariosList, servicosList, veiculosList] =
          await Promise.all([
            listClientes(),
            listFuncionarios(),
            listServicos(),
            listVeiculos(),
          ]);

        setData({
          clientes: clientesList,
          funcionarios: funcionariosList,
          servicos: servicosList,
          veiculos: veiculosList,
        });
      } catch (err) {
        //console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os indicadores"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const faturamentoEstimado = useMemo(() => {
    return data.servicos.reduce((acc, item) => acc + (item.Valor ?? 0), 0);
  }, [data.servicos]);

  const veiculosEmAndamento = useMemo(() => {
    return data.veiculos.filter((veiculo) => veiculo.Situacao === 1).length;
  }, [data.veiculos]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Clientes ativos"
          value={loading ? "--" : String(data.clientes.length)}
          helper="Cadastro completo e situação ativa"
          trend={{ value: "+8%", label: "vs. mês anterior", positive: true }}
        />
        <StatCard
          title="Funcionarios"
          value={loading ? "--" : String(data.funcionarios.length)}
          helper="Funcionarios cadastrados"
        />
        <StatCard
          title="Serviços registrados"
          value={loading ? "--" : String(data.servicos.length)}
          helper="Catálogo geral de serviços"
        />
        <StatCard
          title="Faturamento estimado"
          value={loading ? "--" : formatCurrency(faturamentoEstimado)}
          helper="Somatório do valor dos serviços"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <SectionHeader
          title="Clientes"
          description="Resumo dos últimos cadastros e situação atual."
        />
        <DataTable
          data={loading ? [] : data.clientes.slice(0, 5)}
          columns={[
            { header: "Nome", key: "Nome" },
            { header: "E-mail", key: "Email" },
            { header: "Cidade", key: "Cidade" },
            { header: "Estado", key: "Estado", width: "80px" },
              {
                header: "Situação",
                key: "Situacao",
                render: (item) => (
                  <span
                    className={`badge ${
                      item.Situacao === 1 ? "badge-success" : "badge-warning"
                    }`}
                  >
                    {resolveSituacao(item.Situacao)}
                  </span>
                ),
              },
          ]}
          emptyMessage={
            loading ? "Carregando clientes..." : "Nenhum cliente cadastrado"
          }
          getRowId={(cliente) => cliente.Id}
        />
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Veículos em atendimento"
          description="Ordem de serviço e status do atendimento em andamento."
        />
        <DataTable
          data={loading ? [] : data.veiculos.slice(0, 5)}
          columns={[
            { header: "Veículo", key: "NomeVeiculo" },
            { header: "Placa", key: "PlacaVeiculo", width: "120px" },
            { header: "Combustível", key: "Combustivel" },
            {
              header: "Situacao",
              key: "Situacao",
              render: (item) => (
                <span
                  className={`badge ${
                    item.Situacao === 1 ? "badge-success" : "badge-warning"
                  }`.trim()}
                >
                  {resolveStatusVeiculo(item.Situacao)}
                </span>
              ),
            },
          ]}
          emptyMessage={
            loading ? "Carregando veículos..." : "Nenhum veículo encontrado"
          }
          getRowId={(veiculo) => veiculo.Id}
        />
        <div className="rounded-2xl bg-blue-600 p-6 text-sm text-white sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-blue-100">
              Atendimento ativo
            </p>
            <p className="mt-2 text-lg font-semibold">
              {loading ? "--" : veiculosEmAndamento} veículos em andamento
            </p>
            <p className="mt-1 text-white/60">
              Acompanhe o status e atualize o progresso direto pelo painel.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 sm:mt-0">
            <span className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/80">
              SLA médio: 48h
            </span>
            <span className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/80">
              Prioridade: Alta
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
