import { redirect } from "next/navigation";

interface DashboardSectionPageProps {
  sectionId: string;
}

const sectionRouteMap: Record<string, string> = {
  "visao-geral": "/visao-geral",
  clientes: "/clientes",
  equipe: "/funcionarios",
  funcionarios: "/funcionarios",
  pedidos: "/pedidos",
  servicos: "/servicos",
  pecas: "/pecas",
  veiculos: "/veiculos",
  marcas: "/marcas",
  cores: "/veiculos",
};

export function DashboardSectionPage({
  sectionId,
}: DashboardSectionPageProps) {
  return redirect(sectionRouteMap[sectionId] ?? "/visao-geral");
}
