"use client";

import { useState } from "react";
import EnrollForm from "./components/EnrollForm";
import VerifyPanel from "./components/VerifyPanel";

type Tab = "enroll" | "verify";

export default function Home() {
  const [tab, setTab] = useState<Tab>("verify");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-6 w-6 text-accent"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
            <span className="text-sm font-semibold tracking-tight">
              FaceGuard
            </span>
          </div>
          <div className="flex gap-1 rounded-lg bg-card p-1">
            <button
              onClick={() => setTab("verify")}
              type="button"
              className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${tab === "verify"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
                }`}
            >
              Verificar
            </button>
            <button
              onClick={() => setTab("enroll")}
              type="button"
              className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${tab === "enroll"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
                }`}
            >
              Cadastrar
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="rounded-2xl border border-card-border bg-card/50 p-6">
          <h1 className="mb-1 text-lg font-semibold">
            {tab === "verify"
              ? "Verificação de Acesso"
              : "Cadastro de Utilizador"}
          </h1>
          <p className="mb-6 text-sm text-muted">
            {tab === "verify"
              ? "Posicione o rosto em frente à câmara para autenticação."
              : "Preencha os dados e capture uma foto para cadastro."}
          </p>

          {tab === "enroll" ? <EnrollForm /> : <VerifyPanel />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-card-border py-4 text-center text-xs text-muted">
        FaceGuard &mdash; Reconhecimento facial com face-api.js &amp; TensorFlow.js
      </footer>
    </div>
  );
}
