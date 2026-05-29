"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { getUserFromToken } from "@/services/auth";
import { listClientes } from "@/services/clientes";
import { getErrorMessage } from "@/services/errors";
import { listFuncionarios } from "@/services/funcionarios";
import { createPedido, deletePedido, getPedido, listPedidos, updatePedido } from "@/services/pedidos";
import { listPecas } from "@/services/pecas";
import { listServicos } from "@/services/servicos";
import { listVeiculos } from "@/services/veiculos";
import type {
  Cliente,
  Funcionario,
  Peca,
  Pedido,
  PedidoPeca,
  PedidoServico,
  Servico,
  Veiculo,
} from "@/types/entities";

interface FormState {
  idCliente: string;
  idFuncionario: string;
  idOficina: string;
  idVeiculo: string;
  ValorTotal: string;
  DescontoReais: string;
  DescontoPorcentagem: string;
  DescontoTotalReais: string;
  DescontoServicoPorcentagem: string;
  DescontoServicoReais: string;
  DescontoPecaPorcentagem: string;
  descontoPecaReais: string;
  Observacao: string;
  DataInicio: string;
  DataFim: string;
  IdServico: string;
  QuantVezes: string;
  IdPeca: string;
  QuantidadePeca: string;
  DataInstalacao: string;
  EstadoPeca: string;
  ObservacaoPeca: string;
}

interface PedidoState {
  pedidos: Pedido[];
  clientes: Cliente[];
  funcionarios: Funcionario[];
  veiculos: Veiculo[];
  servicos: Servico[];
  pecas: Peca[];
}

const today = new Date().toISOString().slice(0, 10);

const initialState: PedidoState = {
  pedidos: [],
  clientes: [],
  funcionarios: [],
  veiculos: [],
  servicos: [],
  pecas: [],
};

const initialForm: FormState = {
  idCliente: "",
  idFuncionario: "",
  idOficina: "",
  idVeiculo: "",
  ValorTotal: "0",
  DescontoReais: "0",
  DescontoPorcentagem: "0",
  DescontoTotalReais: "0",
  DescontoServicoPorcentagem: "0",
  DescontoServicoReais: "0",
  DescontoPecaPorcentagem: "0",
  descontoPecaReais: "0",
  Observacao: "",
  DataInicio: today,
  DataFim: today,
  IdServico: "",
  QuantVezes: "1",
  IdPeca: "",
  QuantidadePeca: "1",
  DataInstalacao: today,
  EstadoPeca: "",
  ObservacaoPeca: "",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function formatDate(value?: string | null) {
  if (!value || value.startsWith("0001-01-01")) {
    return "-";
  }

  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("pt-BR");
}

function getStatusLabel(pedido: Pedido) {
  if (pedido.DataFim && !pedido.DataFim.startsWith("0001-01-01")) {
    return "Programado";
  }

  return "Aberto";
}

export function PedidoSection() {
  const role = getUserFromToken()?.role;
  const canAccessPedidos = role === "Admin" || role === "Oficina";
  const [data, setData] = useState<PedidoState>(initialState);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!canAccessPedidos) {
      setLoading(false);
      setFeedback("O backend libera pedidos apenas para Admin ou Oficina neste painel.");
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);

      const [pedidos, clientes, funcionarios, veiculos, servicos, pecas] =
        await Promise.all([
          listPedidos(),
          listClientes(),
          listFuncionarios(),
          listVeiculos(),
          listServicos(),
          listPecas(),
        ]);

      setData({ pedidos, clientes, funcionarios, veiculos, servicos, pecas });
    } catch (error) {
      setFeedback(getErrorMessage(error, "Nao foi possivel carregar os pedidos."));
    } finally {
      setLoading(false);
    }
  }, [canAccessPedidos]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const clientesById = useMemo(
    () => new Map(data.clientes.map((cliente) => [cliente.Id, cliente.Nome])),
    [data.clientes]
  );

  const funcionariosById = useMemo(
    () =>
      new Map(data.funcionarios.map((funcionario) => [funcionario.Id, funcionario.Nome])),
    [data.funcionarios]
  );

  const veiculosById = useMemo(
    () => new Map(data.veiculos.map((veiculo) => [veiculo.Id, veiculo])),
    [data.veiculos]
  );

  const servicosById = useMemo(
    () => new Map(data.servicos.map((servico) => [servico.Id, servico])),
    [data.servicos]
  );

  const pecasById = useMemo(
    () => new Map(data.pecas.map((peca) => [peca.Id, peca])),
    [data.pecas]
  );

  const filteredVeiculos = useMemo(() => {
    if (!form.idCliente) {
      return data.veiculos;
    }

    return data.veiculos.filter((veiculo) => veiculo.ClienteId === Number(form.idCliente));
  }, [data.veiculos, form.idCliente]);

  const filteredPedidos = useMemo(() => {
    if (!search.trim()) {
      return data.pedidos;
    }

    const term = search.toLowerCase();
    return data.pedidos.filter((pedido) => {
      const veiculo = veiculosById.get(pedido.idVeiculo);

      return [
        String(pedido.Id),
        pedido.Observacao,
        clientesById.get(pedido.idCliente),
        funcionariosById.get(pedido.idFuncionario),
        veiculo?.NomeVeiculo,
        veiculo?.PlacaVeiculo,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term));
    });
  }, [clientesById, data.pedidos, funcionariosById, search, veiculosById]);

  const totalCatalogado = useMemo(
    () => data.pedidos.reduce((acc, pedido) => acc + pedido.ValorTotal, 0),
    [data.pedidos]
  );

  function getDefaultOficinaId() {
    return getUserFromToken()?.oficinaId?.toString() ?? "";
  }

  function resetForm() {
    const defaultCliente = data.clientes[0]?.Id.toString() ?? "";
    const defaultVeiculo =
      data.veiculos.find((veiculo) => veiculo.ClienteId === Number(defaultCliente))?.Id.toString() ??
      data.veiculos[0]?.Id.toString() ??
      "";

    setForm({
      ...initialForm,
      idCliente: defaultCliente,
      idFuncionario: data.funcionarios[0]?.Id.toString() ?? "",
      idOficina: getDefaultOficinaId(),
      idVeiculo: defaultVeiculo,
      IdServico: data.servicos[0]?.Id.toString() ?? "",
      IdPeca: "",
    });
    setEditingId(null);
    setShowModal(false);
  }

  function openModalForCreate() {
    if (!canAccessPedidos) {
      setFeedback("Seu perfil nao pode criar pedidos neste backend.");
      return;
    }

    if (data.clientes.length === 0 || data.funcionarios.length === 0 || data.veiculos.length === 0) {
      setFeedback("Cadastre cliente, colaborador e veiculo antes de abrir um pedido.");
      return;
    }

    resetForm();
    setShowModal(true);
  }

  function populateForm(pedido: Pedido) {
    const firstServico = pedido.Pedido_Servicos[0];
    const firstPeca = pedido.Pedido_Pecas[0];

    setEditingId(pedido.Id);
    setForm({
      idCliente: String(pedido.idCliente ?? ""),
      idFuncionario: String(pedido.idFuncionario ?? ""),
      idOficina: String(pedido.idOficina || getDefaultOficinaId()),
      idVeiculo: String(pedido.idVeiculo ?? ""),
      ValorTotal: String(pedido.ValorTotal ?? 0),
      DescontoReais: String(pedido.DescontoReais ?? 0),
      DescontoPorcentagem: String(pedido.DescontoPorcentagem ?? 0),
      DescontoTotalReais: String(pedido.DescontoTotalReais ?? 0),
      DescontoServicoPorcentagem: String(pedido.DescontoServicoPorcentagem ?? 0),
      DescontoServicoReais: String(pedido.DescontoServicoReais ?? 0),
      DescontoPecaPorcentagem: String(pedido.DescontoPecaPorcentagem ?? 0),
      descontoPecaReais: String(pedido.descontoPecaReais ?? 0),
      Observacao: pedido.Observacao ?? "",
      DataInicio: pedido.DataInicio?.slice(0, 10) || today,
      DataFim: pedido.DataFim?.slice(0, 10) || today,
      IdServico: firstServico ? String(firstServico.IdServico) : "",
      QuantVezes: firstServico ? String(firstServico.QuantVezes) : "1",
      IdPeca: firstPeca ? String(firstPeca.IdPeca) : "",
      QuantidadePeca: firstPeca ? String(firstPeca.Quantidade) : "1",
      DataInstalacao: firstPeca?.DataInstalacao?.slice(0, 10) || today,
      EstadoPeca: firstPeca?.Estado ?? "",
      ObservacaoPeca: firstPeca?.Observacao ?? "",
    });
    setShowModal(true);
  }

  function calculateSuggestedTotal() {
    const servico = servicosById.get(Number(form.IdServico));
    const peca = pecasById.get(Number(form.IdPeca));
    const servicoTotal = (servico?.Valor ?? 0) * (Number(form.QuantVezes) || 0);
    const pecaTotal = (peca?.Valor ?? 0) * (Number(form.QuantidadePeca) || 0);
    const discounts =
      (Number(form.DescontoReais) || 0) +
      (Number(form.DescontoServicoReais) || 0) +
      (Number(form.descontoPecaReais) || 0) +
      (Number(form.DescontoTotalReais) || 0);

    return Math.max(servicoTotal + pecaTotal - discounts, 0);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.idCliente || !form.idFuncionario || !form.idVeiculo) {
      setFeedback("Selecione cliente, colaborador e veiculo para salvar o pedido.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const pedidoServicos: PedidoServico[] = form.IdServico
      ? [
          {
            IdPedido: editingId ?? 0,
            IdServico: Number(form.IdServico),
            QuantVezes: Number(form.QuantVezes) || 1,
          },
        ]
      : [];

    const pedidoPecas: PedidoPeca[] = form.IdPeca
      ? [
          {
            IdPedido: editingId ?? 0,
            IdPeca: Number(form.IdPeca),
            Quantidade: Number(form.QuantidadePeca) || 1,
            DataInstalacao: form.DataInstalacao,
            Estado: form.EstadoPeca,
            Observacao: form.ObservacaoPeca,
          },
        ]
      : [];

    const manualTotal = Number(form.ValorTotal) || 0;
    const payload: Partial<Pedido> = {
      idCliente: Number(form.idCliente),
      idFuncionario: Number(form.idFuncionario),
      idOficina: Number(form.idOficina) || 0,
      idVeiculo: Number(form.idVeiculo),
      ValorTotal: manualTotal > 0 ? manualTotal : calculateSuggestedTotal(),
      DescontoReais: Number(form.DescontoReais) || 0,
      DescontoPorcentagem: Number(form.DescontoPorcentagem) || 0,
      DescontoTotalReais: Number(form.DescontoTotalReais) || 0,
      DescontoServicoPorcentagem: Number(form.DescontoServicoPorcentagem) || 0,
      DescontoServicoReais: Number(form.DescontoServicoReais) || 0,
      DescontoPecaPorcentagem: Number(form.DescontoPecaPorcentagem) || 0,
      descontoPecaReais: Number(form.descontoPecaReais) || 0,
      Observacao: form.Observacao,
      DataInicio: form.DataInicio,
      DataFim: form.DataFim,
      Pedido_Servicos: pedidoServicos,
      Pedido_Pecas: pedidoPecas,
    };

    try {
      if (editingId) {
        await updatePedido(editingId, payload);
        setFeedback("Pedido atualizado com sucesso.");
      } else {
        await createPedido(payload);
        setFeedback("Pedido cadastrado com sucesso.");
      }

      await refresh();
      resetForm();
    } catch (error) {
      setFeedback(getErrorMessage(error, "Nao foi possivel salvar o pedido."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(pedido: Pedido) {
    if (!window.confirm(`Remover o pedido #${pedido.Id}?`)) {
      return;
    }

    try {
      await deletePedido(pedido.Id);
      setFeedback("Pedido removido com sucesso.");
      await refresh();
    } catch (error) {
      setFeedback(getErrorMessage(error, "Nao foi possivel remover o pedido."));
    }
  }

  async function openDetails(pedidoId: number) {
    try {
      setDetailLoading(true);
      setFeedback(null);
      setSelectedPedido(await getPedido(pedidoId));
    } catch (error) {
      setFeedback(getErrorMessage(error, "Nao foi possivel carregar os detalhes do pedido."));
    } finally {
      setDetailLoading(false);
    }
  }

  function renderVehicleLabel(pedido: Pedido) {
    const veiculo = veiculosById.get(pedido.idVeiculo);
    return veiculo ? `${veiculo.NomeVeiculo || "Veiculo"} / ${veiculo.PlacaVeiculo || "-"}` : `#${pedido.idVeiculo}`;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Pedidos"
          value={loading ? "--" : String(data.pedidos.length)}
          helper="Ordens retornadas pela API"
        />
        <StatCard
          title="Receita em pedidos"
          value={loading ? "--" : formatCurrency(totalCatalogado)}
          helper="Soma dos valores registrados"
        />
        <StatCard
          title="Base operacional"
          value={loading ? "--" : String(data.veiculos.length)}
          helper="Veiculos disponiveis para vinculo"
        />
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Pedidos"
          description="Cadastre e acompanhe ordens de servico com cliente, veiculo, colaborador, servico e peca vinculados."
          actionSlot={
            <div className="flex items-center gap-3">
              <button type="button" onClick={openModalForCreate} className="button-primary">
                Novo pedido
              </button>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por pedido, cliente, placa ou observacao"
                className="toolbar-search w-80"
              />
            </div>
          }
        />

        {feedback && <div className="feedback-info">{feedback}</div>}

        <DataTable
          data={filteredPedidos}
          columns={[
            { header: "Pedido", key: "Id", width: "90px", render: (pedido: Pedido) => `#${pedido.Id}` },
            {
              header: "Cliente",
              key: "idCliente",
              render: (pedido: Pedido) => clientesById.get(pedido.idCliente) ?? `#${pedido.idCliente}`,
            },
            {
              header: "Veiculo",
              key: "idVeiculo",
              render: (pedido: Pedido) => renderVehicleLabel(pedido),
            },
            {
              header: "Inicio",
              key: "DataInicio",
              width: "120px",
              render: (pedido: Pedido) => formatDate(pedido.DataInicio),
            },
            {
              header: "Status",
              key: "Status",
              width: "120px",
              render: (pedido: Pedido) => <span className="badge badge-warning">{getStatusLabel(pedido)}</span>,
            },
            {
              header: "Total",
              key: "ValorTotal",
              align: "right",
              render: (pedido: Pedido) => formatCurrency(pedido.ValorTotal),
            },
            {
              header: "Acoes",
              key: "acoes",
              render: (pedido: Pedido) => (
                <div className="flex flex-wrap gap-2 text-xs">
                  <button type="button" onClick={() => openDetails(pedido.Id)} className="button-inline">
                    Detalhes
                  </button>
                  <button type="button" onClick={() => populateForm(pedido)} className="button-inline">
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(pedido)}
                    className="button-inline-danger"
                  >
                    Remover
                  </button>
                </div>
              ),
            },
          ]}
          emptyMessage={loading ? "Carregando pedidos..." : "Nenhum pedido cadastrado"}
          getRowId={(pedido) => pedido.Id}
        />
      </section>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-scrim" onClick={() => setShowModal(false)} />
          <div className="modal-card max-w-4xl">
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">{editingId ? "Editar" : "Novo"} pedido</p>
                <h3 className="modal-title">
                  {editingId ? "Atualize a ordem" : "Monte a ordem de servico"}
                </h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="button-ghost">
                Fechar
              </button>
            </div>

            <form id="pedido-form" className="modal-body" onSubmit={handleSubmit}>
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <label className="field-label">Cliente</label>
                  <select
                    required
                    value={form.idCliente}
                    onChange={(event) => {
                      const idCliente = event.target.value;
                      const nextVehicle = data.veiculos.find(
                        (veiculo) => veiculo.ClienteId === Number(idCliente)
                      );
                      setForm((prev) => ({
                        ...prev,
                        idCliente,
                        idVeiculo: nextVehicle ? String(nextVehicle.Id) : "",
                      }));
                    }}
                    className="field-select mt-2"
                  >
                    <option value="">Selecione</option>
                    {data.clientes.map((cliente) => (
                      <option key={cliente.Id} value={cliente.Id}>
                        {cliente.Nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Veiculo</label>
                  <select
                    required
                    value={form.idVeiculo}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, idVeiculo: event.target.value }))
                    }
                    className="field-select mt-2"
                  >
                    <option value="">Selecione</option>
                    {filteredVeiculos.map((veiculo) => (
                      <option key={veiculo.Id} value={veiculo.Id}>
                        {veiculo.NomeVeiculo} / {veiculo.PlacaVeiculo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Colaborador</label>
                  <select
                    required
                    value={form.idFuncionario}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, idFuncionario: event.target.value }))
                    }
                    className="field-select mt-2"
                  >
                    <option value="">Selecione</option>
                    {data.funcionarios.map((funcionario) => (
                      <option key={funcionario.Id} value={funcionario.Id}>
                        {funcionario.Nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Oficina ID</label>
                  <input
                    type="number"
                    value={form.idOficina}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, idOficina: event.target.value }))
                    }
                    placeholder="Preenchido pelo login"
                    className="field-input mt-2"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="field-label">Data inicial</label>
                  <input
                    required
                    type="date"
                    value={form.DataInicio}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, DataInicio: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Data final</label>
                  <input
                    required
                    type="date"
                    value={form.DataFim}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, DataFim: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Valor total</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.ValorTotal}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, ValorTotal: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="surface-muted">
                  <p className="field-label">Servico vinculado</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-[1fr_120px]">
                    <select
                      value={form.IdServico}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, IdServico: event.target.value }))
                      }
                      className="field-select"
                    >
                      <option value="">Sem servico</option>
                      {data.servicos.map((servico) => (
                        <option key={servico.Id} value={servico.Id}>
                          {servico.Nome}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={form.QuantVezes}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, QuantVezes: event.target.value }))
                      }
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="surface-muted">
                  <p className="field-label">Peca vinculada</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-[1fr_120px]">
                    <select
                      value={form.IdPeca}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, IdPeca: event.target.value }))
                      }
                      className="field-select"
                    >
                      <option value="">Sem peca</option>
                      {data.pecas.map((peca) => (
                        <option key={peca.Id} value={peca.Id}>
                          {peca.Nome}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={form.QuantidadePeca}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, QuantidadePeca: event.target.value }))
                      }
                      className="field-input"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="field-label">Instalacao da peca</label>
                  <input
                    type="date"
                    value={form.DataInstalacao}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, DataInstalacao: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Estado da peca</label>
                  <input
                    value={form.EstadoPeca}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, EstadoPeca: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Obs. da peca</label>
                  <input
                    value={form.ObservacaoPeca}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, ObservacaoPeca: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <label className="field-label">Desc. pedido R$</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.DescontoReais}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, DescontoReais: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Desc. pedido %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.DescontoPorcentagem}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, DescontoPorcentagem: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Desc. servico R$</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.DescontoServicoReais}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, DescontoServicoReais: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
                <div>
                  <label className="field-label">Desc. peca R$</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.descontoPecaReais}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, descontoPecaReais: event.target.value }))
                    }
                    className="field-input mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Observacao</label>
                <textarea
                  value={form.Observacao}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, Observacao: event.target.value }))
                  }
                  rows={3}
                  className="field-textarea mt-2"
                />
              </div>
            </form>

            <div className="modal-footer">
              <button type="button" onClick={() => setShowModal(false)} className="button-cancel">
                Cancelar
              </button>
              <button
                type="submit"
                form="pedido-form"
                disabled={submitting}
                className="button-success disabled:opacity-60"
              >
                {submitting ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPedido && (
        <div className="modal-overlay">
          <div className="modal-scrim" onClick={() => setSelectedPedido(null)} />
          <div className="modal-card max-w-3xl">
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">Pedido #{selectedPedido.Id}</p>
                <h3 className="modal-title">{renderVehicleLabel(selectedPedido)}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPedido(null)}
                className="button-ghost"
              >
                Fechar
              </button>
            </div>
            <div className="modal-body">
              {detailLoading && <div className="feedback-info">Carregando detalhes...</div>}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="surface-highlight">
                  <p className="field-label">Resumo</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p>Cliente: {clientesById.get(selectedPedido.idCliente) ?? `#${selectedPedido.idCliente}`}</p>
                    <p>Colaborador: {funcionariosById.get(selectedPedido.idFuncionario) ?? `#${selectedPedido.idFuncionario}`}</p>
                    <p>Periodo: {formatDate(selectedPedido.DataInicio)} ate {formatDate(selectedPedido.DataFim)}</p>
                    <p>Total: {formatCurrency(selectedPedido.ValorTotal)}</p>
                  </div>
                </div>
                <div className="app-subcard">
                  <p className="field-label">Observacao</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {selectedPedido.Observacao || "Nenhuma observacao registrada."}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="app-subcard">
                  <p className="field-label">Servicos</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {selectedPedido.Pedido_Servicos.length === 0 ? (
                      <p>Nenhum servico vinculado.</p>
                    ) : (
                      selectedPedido.Pedido_Servicos.map((servico) => (
                        <p key={`${servico.IdPedido}-${servico.IdServico}`}>
                          {servicosById.get(servico.IdServico)?.Nome ?? `Servico #${servico.IdServico}`} -
                          {" "}Qtd. {servico.QuantVezes}
                        </p>
                      ))
                    )}
                  </div>
                </div>
                <div className="app-subcard">
                  <p className="field-label">Pecas</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {selectedPedido.Pedido_Pecas.length === 0 ? (
                      <p>Nenhuma peca vinculada.</p>
                    ) : (
                      selectedPedido.Pedido_Pecas.map((peca) => (
                        <p key={`${peca.IdPedido}-${peca.IdPeca}`}>
                          {pecasById.get(peca.IdPeca)?.Nome ?? `Peca #${peca.IdPeca}`} -
                          {" "}Qtd. {peca.Quantidade}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
