import { ReactNode } from "react";
import { ClientesSection } from "@/components/dashboard/ClientesSection";
import { CoresSection } from "@/components/dashboard/CoresSection";
import { FuncionariosSection } from "@/components/dashboard/FuncionariosSection";
import { MarcasSection } from "@/components/dashboard/MarcasSection";
import { OverviewSection } from "@/components/dashboard/OverviewSection";
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
    label: "Início",
    icon: "IN",
    title: "Indicadores e resumo semanal",
    subtitle:
      "Acompanhe o desempenho da oficina, clientes ativos e andamento das ordens de serviço.",
    component: <OverviewSection />,
  },
  {
    id: "clientes",
    href: "/clientes",
    label: "Clientes",
    icon: "CL",
    title: "Gestão de clientes",
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
      "Controle sua equipe interna, cargos, contatos e situação dos colaboradores.",
    component: <FuncionariosSection />,
  },
  {
    id: "servicos",
    href: "/servicos",
    label: "Serviços",
    icon: "SV",
    title: "Portfólio de serviços",
    subtitle:
      "Defina preços, descrições e garantias para seus serviços de manutenção.",
    component: <ServicosSection />,
  },
  {
    id: "veiculos",
    href: "/veiculos",
    label: "Veículos",
    icon: "VH",
    title: "Veículos cadastrados",
    subtitle:
      "Gerencie o histórico de veículos, vincule cores e acompanhe o status de atendimento.",
    component: <VeiculosSection />,
  },
  {
    id: "marcas",
    href: "/marcas",
    label: "Marcas",
    icon: "MK",
    title: "Catálogo de marcas",
    subtitle:
      "Organize as marcas e linhas de produtos para facilitar o cadastro de veículos.",
    component: <MarcasSection />,
  },
  {
    id: "cores",
    href: "/cores",
    label: "Cores",
    icon: "CR",
    title: "Cores disponíveis",
    subtitle:
      "Cadastre cores para vincular aos veículos e manter o estoque organizado.",
    component: <CoresSection />,
  },
];

export function getAppSection(sectionId: string) {
  return appSections.find((section) => section.id === sectionId);
}
