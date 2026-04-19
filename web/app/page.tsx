"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import EnrollForm from "./components/EnrollForm";
import VerifyPanel from "./components/VerifyPanel";
import UsersPanel from "./components/UsersPanel";

type Tab = "verify" | "enroll" | "users";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("verify");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [autoMode, setAutoMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTab = localStorage.getItem("faceguard_active_tab");
    if (savedTab === "verify" || savedTab === "enroll" || savedTab === "users") {
      setTab(savedTab as Tab);
    }
    const savedAutoMode = localStorage.getItem("faceguard_auto_mode");
    if (savedAutoMode === "true") {
      setAutoMode(true);
    }
  }, []);

  const handleTabChange = (t: Tab) => {
    setTab(t);
    localStorage.setItem("faceguard_active_tab", t);
  };

  const handleAutoModeChange = () => {
    const newVal = !autoMode;
    setAutoMode(newVal);
    localStorage.setItem("faceguard_auto_mode", String(newVal));
  };

  const titles: Record<Tab, string> = {
    verify: "Permissão de Acesso",
    enroll: "Cadastro de Usuário",
    users: "Listagem/Edição de Usuários",
  };

  const descriptions: Record<Tab, string> = {
    verify: "Posicione o rosto em frente à câmera para autenticação.",
    enroll: "Preencha os dados e capture uma foto para cadastro.",
    users: "Gerencie os usuários cadastrados no sistema.",
  };

  if (!mounted) {
    return <div className="min-h-screen bg-background" />; // Evita erro de hydration (Next.js)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header — using original FIES bg.jpg for the stripe bar */}
      <header className="relative z-50">
        <div
          className="h-10 sm:h-12"
          style={{
            backgroundImage: "url('/header-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "top center",
          }}
        />
        <div className="bg-white border-b border-card-border shadow-sm">
          <div className="mx-auto flex h-16 sm:h-20 max-w-5xl items-center justify-between px-4">
            {/* Logo */}
            <Image
              src="/logo.png"
              alt="FaceGuard logo"
              width={260}
              height={65}
              className="h-10 sm:h-14 w-auto object-contain"
              priority
            />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5 pt-1">
              {tab === "verify" && (
                <div className="flex items-center gap-2 mr-2 bg-surface px-3 py-1.5 rounded-md border border-card-border/50" title="Verificação automática sem cliques">
                  <span className="text-xs text-muted-light font-medium uppercase">Câmera sempre ativa</span>
                  <button
                    onClick={handleAutoModeChange}
                    type="button"
                    className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${autoMode ? "bg-accent" : "bg-card-border"}`}
                    role="switch"
                    aria-checked={autoMode}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${autoMode ? "translate-x-4" : "translate-x-1"}`} />
                  </button>
                </div>
              )}
              {(["verify", "enroll", "users"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTabChange(t)}
                  className={`cursor-pointer px-5 py-2 rounded-md font-semibold text-sm transition-colors ${tab === t
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:bg-surface hover:text-foreground"
                    }`}
                >
                  {t === "verify" ? "Verificar" : t === "enroll" ? "Cadastrar" : "Usuários"}
                </button>
              ))}
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -mr-2 text-foreground cursor-pointer focus:outline-none focus:bg-surface rounded-md transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-label="Alternar menu de navegação"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-card-border shadow-md py-2 px-4 flex flex-col gap-1 origin-top animate-none">
            {tab === "verify" && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-card-border/50 mb-1 bg-surface/50 rounded-md">
                <span className="text-[15px] font-medium text-foreground">Câmera sempre ativa</span>
                <button
                  onClick={handleAutoModeChange}
                  type="button"
                  className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${autoMode ? "bg-accent" : "bg-card-border"}`}
                  role="switch"
                  aria-checked={autoMode}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${autoMode ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            )}
            {(["verify", "enroll", "users"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  handleTabChange(t);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-md font-medium text-[15px] transition-colors ${tab === t
                  ? "bg-accent/10 border-l-4 border-accent text-accent"
                  : "text-muted hover:bg-surface hover:text-foreground border-l-4 border-transparent"
                  }`}
              >
                {t === "verify" ? "Permissão de Acesso" : t === "enroll" ? "Novo Usuário" : "Listagem de Usuários"}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="flex flex-col items-center">
          {/* Title block */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-8 w-8 text-white"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-accent uppercase tracking-wider">
              {titles[tab]}
            </h1>
            <p className="mt-1 text-sm text-muted">{descriptions[tab]}</p>
          </div>


          {/* Card */}
          <div className="w-full max-w-2xl rounded-xl border border-card-border bg-card p-6 shadow-sm">
            {tab === "verify" && <VerifyPanel autoMode={autoMode} />}
            {tab === "enroll" && <EnrollForm />}
            {tab === "users" && <UsersPanel />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-card-border bg-surface py-4 text-center text-xs text-muted">
        FaceGuard &mdash; O Reconhecimento facial do SENAI
      </footer>
    </div>
  );
}
