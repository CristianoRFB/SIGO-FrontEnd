import { appSections } from "@/lib/app-sections";

export interface PanelNavItem {
  href: string;
  label: string;
  icon: string;
  title: string;
  subtitle: string;
}

const visibleSectionIds = new Set([
  "inicio",
  "clientes",
  "funcionarios",
  "servicos",
  "veiculos",
  "marcas",
]);

export const panelNavigation: PanelNavItem[] = appSections
  .filter((section) => visibleSectionIds.has(section.id))
  .map((section) => ({
    href: section.href,
    label: section.label,
    icon: section.icon,
    title: section.title,
    subtitle: section.subtitle,
  }));

export function getPanelMeta(pathname: string) {
  return panelNavigation.find((item) => pathname === item.href) ?? panelNavigation[0];
}
