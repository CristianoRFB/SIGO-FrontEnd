import { ReactNode } from "react";
import { ClientesSection } from "@/components/dashboard/ClientesSection";
import { FuncionariosSection } from "@/components/dashboard/FuncionariosSection";
import { MarcasSection } from "@/components/dashboard/MarcasSection";
import { OverviewSection } from "@/components/dashboard/OverviewSection";
import { PecasSection } from "@/components/dashboard/PecasSection";
import { PedidoSection } from "@/components/dashboard/PedidoSection";
import { ServicosSection } from "@/components/dashboard/ServicosSection";
import { VeiculosSection } from "@/components/dashboard/VeiculosSection";

export interface AppSectionDefinition {
  id: string;
  href: string;
  label: string;
  icon: string;
  title: string;
  subtitle: string;
  component: ReactNode;
}

export const appSections: AppSectionDefinition[] = [
  {
    id: "inicio",
    href: "/visao-geral",
    label: "Inicio",
    icon: "IN",
    title: "Indicadores e resumo semanal",
    subtitle:
      "Acompanhe o desempenho da oficina, clientes ativos e andamento das ordens de servico.",
    component: <OverviewSection />,
  },
  {
    id: "clientes",
    href: "/clientes",
    label: "Clientes",
    icon: "CL",
    title: "Gestao de clientes",
    subtitle:
      "Cadastre novos clientes, atualize dados e acompanhe o relacionamento da sua base.",
    component: <ClientesSection />,
  },
  {
    id: "funcionarios",
    href: "/funcionarios",
    label: "Equipe",
    icon: "EQ",
    title: "Equipe e cargos",
    subtitle:
      "Controle sua equipe interna, cargos, contatos e situacao dos colaboradores.",
    component: <FuncionariosSection />,
  },
  {
    id: "pedidos",
    href: "/pedidos",
    label: "Pedidos",
    icon: "PD",
    title: "Ordens de servico",
    subtitle:
      "Cadastre pedidos com cliente, veiculo, equipe, servicos e pecas vinculadas ao atendimento.",
    component: <PedidoSection />,
  },
  {
    id: "servicos",
    href: "/servicos",
    label: "Servicos",
    icon: "SV",
    title: "Portfolio de servicos",
    subtitle:
      "Defina precos, descricoes e garantias para seus servicos de manutencao.",
    component: <ServicosSection />,
  },
  {
    id: "pecas",
    href: "/pecas",
    label: "Pecas",
    icon: "PC",
    title: "Estoque de pecas",
    subtitle:
      "Controle itens, marcas, fornecedores, garantia e quantidade do estoque operacional.",
    component: <PecasSection />,
  },
  {
    id: "veiculos",
    href: "/veiculos",
    label: "Veiculos",
    icon: "VH",
    title: "Veiculos cadastrados",
    subtitle:
      "Gerencie o historico de veiculos e acompanhe o status de atendimento.",
    component: <VeiculosSection />,
  },
  {
    id: "marcas",
    href: "/marcas",
    label: "Marcas",
    icon: "MK",
    title: "Catalogo de marcas",
    subtitle:
      "Organize as marcas e linhas de produtos para facilitar os cadastros operacionais.",
    component: <MarcasSection />,
  },
];

export function getAppSection(sectionId: string) {
  return appSections.find((section) => section.id === sectionId);
}
