import { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

interface PanelLayoutProps {
  children: ReactNode;
}

export default function PanelLayout({ children }: PanelLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
