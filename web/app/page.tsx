"use client";

import { useState } from "react";
import Image from "next/image";
import EnrollForm from "./components/EnrollForm";
import VerifyPanel from "./components/VerifyPanel";
import UsersPanel from "./components/UsersPanel";

type Tab = "verify" | "enroll" | "users";

export default function Home() {
  const [tab, setTab] = useState<Tab>("verify");

  const titles: Record<Tab, string> = {
    verify: "Verificação de Acesso",
    enroll: "Cadastro de Utilizador",
    users: "Gestão de Usuários",
  };

  const descriptions: Record<Tab, string> = {
    verify: "Posicione o rosto em frente à câmara para autenticação.",
    enroll: "Preencha os dados e capture uma foto para cadastro.",
    users: "Gerencie os usuários cadastrados no sistema.",
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header — using original FIES bg.jpg for the stripe bar */}
      <header>
        <div
          className="h-12 sm:h-14"
          style={{
            backgroundImage: "url('/header-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "top center",
          }}
        />
        <div className="bg-white border-b border-card-border">
          <div className="mx-auto flex h-20 max-w-5xl items-center justify-center px-4">
            <Image
              src="/logo.png"
              alt="FaceGuard logo"
              width={320}
              height={80}
              className="h-14 sm:h-16 w-auto object-contain"
              priority
            />
          </div>
        </div>
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

          {/* Tab switcher */}
          <div className="flex mb-6 rounded-lg border border-card-border bg-surface p-1 shadow-sm">
            {(["verify", "enroll", "users"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                type="button"
                className={`cursor-pointer rounded-md px-5 py-2 text-sm font-medium transition-colors ${tab === t
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:text-foreground hover:bg-accent-light"
                  }`}
              >
                {t === "verify" ? "Verificar" : t === "enroll" ? "Cadastrar" : "Usuários"}
              </button>
            ))}
          </div>

          {/* Card */}
          <div className="w-full max-w-2xl rounded-xl border border-card-border bg-card p-6 shadow-sm">
            {tab === "verify" && <VerifyPanel />}
            {tab === "enroll" && <EnrollForm />}
            {tab === "users" && <UsersPanel />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-card-border bg-surface py-4 text-center text-xs text-muted">
        FaceGuard &mdash; Reconhecimento facial com face-api.js &amp; TensorFlow.js
      </footer>
    </div>
  );
}
