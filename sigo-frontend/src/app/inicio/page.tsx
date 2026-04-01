"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header Navigation */}
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <img src="/logo_siga.jpg" alt="SIGO" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-lg font-bold text-slate-900">SIGO</span>
        </div>
        <nav className="hidden gap-3 md:flex">
          <a
            href="#opcoes"
            className="text-sm font-medium text-slate-600 px-3 py-1 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Opções
          </a>
          <a
            href="#precos"
            className="text-sm font-medium text-slate-600 px-3 py-1 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Preços
          </a>
          <a
            href="#recursos"
            className="text-sm font-medium text-slate-600 px-3 py-1 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Recursos
          </a>
          <a
            href="#sobre"
            className="text-sm font-medium text-slate-600 px-3 py-1 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Sobre
          </a>
        </nav>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            Cadastrar-se
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Fazer Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
              Não fique na estrada, siga com a gente.
            </h1>
            <p className="text-lg text-slate-600">
              Customize as peças do seu carro da sua melhor maneira e fáça se tornar real.
            </p>
            <p className="text-sm text-slate-500">
              Focado para tanto o cliente quanto o fornecedor mostrando eficácia e facilidade
            </p>
            <div>
              <Link
                href="/visao-geral"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Veja as Opções
                <span>›</span>
              </Link>
            </div>
          </div>
          <div className="relative h-115 w-full overflow-hidden rounded-3xl bg-slate-100">
            <img
              src="/reparacao.jpg"
              alt="Mecânico em ação"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Main Message Section */}
      <section className="space-y-4 px-6 py-16 text-center lg:px-12 lg:py-24">
        <h2 className="text-3xl font-bold text-slate-900 lg:text-4xl">
          Preparado com soluções adversas que salva dinheiro e tempo para aqueles que precisam
        </h2>
      </section>

      {/* Features Section - Eficácia */}
      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-slate-900">Eficácia</h3>
            <p className="text-lg text-slate-600">
              Nosso sistema vem preparado com máxima eficácia e precisão para os clientes customizarem seus carros.
            </p>
            <Link
              href="/visao-geral"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Saiba mais
              <span>›</span>
            </Link>
          </div>
          <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-slate-100">
            <img
              src="/profissional.jpg"
              alt="Técnico de motores"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section - Sem Burocracia */}
      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative order-2 h-80 w-full overflow-hidden rounded-2xl bg-slate-100 lg:order-1">
            <img
              src="/burocracia.jpg"
              alt="Documentação simples"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="order-1 space-y-6 lg:order-2">
            <h3 className="text-3xl font-bold text-slate-900">Sem burocracia</h3>
            <p className="text-lg text-slate-600">
              Feito para eliminar papeletas desnecessárias e evitar conflitos burocráticos.
            </p>
            <Link
              href="/visao-geral"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Saiba mais
              <span>›</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Satisfação */}
      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-slate-900">Satisfação</h3>
            <p className="text-lg text-slate-600">
              Deixar os clientes satisfeitos é nosso principal objetivo.
            </p>
            <Link
              href="/visao-geral"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Saiba mais
              <span>›</span>
            </Link>
          </div>
          <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-slate-100">
            <img
              src="/cliente.jpg"
              alt="Equipe de atendimento"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 px-6 py-12 lg:px-12">
        <div className="mx-auto grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo_siga.jpg" alt="SIGO" className="h-8 w-8 rounded-full object-cover bg-white" />
              <span className="font-bold text-white">SIGO</span>
            </div>
            <p className="text-sm text-slate-400">
              Soluções eficientes para customização e atendimento de veículos.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Produto</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#opcoes" className="hover:text-white">Opções</a></li>
              <li><a href="#precos" className="hover:text-white">Preços</a></li>
              <li><a href="#recursos" className="hover:text-white">Recursos</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Empresa</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#sobre" className="hover:text-white">Sobre</a></li>
              <li><a href="#contato" className="hover:text-white">Contato</a></li>
              <li><a href="#blog" className="hover:text-white">Blog</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Redes Sociais</h4>
            <ul className="flex gap-4 text-sm">
              <li><a href="#" className="text-slate-400 hover:text-white">Facebook</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white">Instagram</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2025 SIGO. Todos os direitos reservados.</p>
          <p className="mt-4 text-xs text-slate-500">
            Imagens fornecidas por <a href="https://www.freepik.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Freepik</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}
