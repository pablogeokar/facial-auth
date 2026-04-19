"use client";

import { useState } from "react";
import Image from "next/image";
import EnrollForm from "./components/EnrollForm";
import VerifyPanel from "./components/VerifyPanel";

type Tab = "enroll" | "verify";

export default function Home() {
  const [tab, setTab] = useState<Tab>("verify");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header — blue bar with diagonal color stripes */}
      <header>
        {/* Top blue bar with diagonal stripes on the right */}
        <div className="relative bg-accent overflow-hidden h-12 sm:h-14">
          {/* Diagonal color stripes — right side */}
          <svg
            className="absolute right-0 top-0 h-full w-[280px] sm:w-[360px]"
            viewBox="0 0 360 56"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <polygon points="100,0 360,0 360,56 40,56" fill="#ffffff" />
            <polygon points="140,0 360,0 360,56 80,56" fill="#3bb4e5" />
            <polygon points="180,0 360,0 360,56 120,56" fill="#4cb848" />
            <polygon points="210,0 360,0 360,56 150,56" fill="#ef5e31" />
            <polygon points="250,0 360,0 360,56 190,56" fill="#ffffff" />
            <polygon points="280,0 360,0 360,56 220,56" fill="#3bb4e5" />
          </svg>
        </div>

        {/* Logo strip — white background, centered logo */}
        <div className="bg-white border-b border-card-border">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-center px-4">
            <Image
              src="/logo.png"
              alt="FaceGuard logo"
              width={180}
              height={48}
              className="h-10 sm:h-12 w-auto object-contain"
              priority
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="flex flex-col items-center">
          {/* Logo + title block */}
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
              {tab === "verify" ? "Verificação de Acesso" : "Cadastro de Utilizador"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {tab === "verify"
                ? "Posicione o rosto em frente à câmara para autenticação."
                : "Preencha os dados e capture uma foto para cadastro."}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex mb-6 rounded-lg border border-card-border bg-surface p-1 shadow-sm">
            <button
              onClick={() => setTab("verify")}
              type="button"
              className={`cursor-pointer rounded-md px-5 py-2 text-sm font-medium transition-colors ${tab === "verify"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-foreground hover:bg-accent-light"
                }`}
            >
              Verificar
            </button>
            <button
              onClick={() => setTab("enroll")}
              type="button"
              className={`cursor-pointer rounded-md px-5 py-2 text-sm font-medium transition-colors ${tab === "enroll"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-foreground hover:bg-accent-light"
                }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Card */}
          <div className="w-full max-w-2xl rounded-xl border border-card-border bg-card p-6 shadow-sm">
            {tab === "enroll" ? <EnrollForm /> : <VerifyPanel />}
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
