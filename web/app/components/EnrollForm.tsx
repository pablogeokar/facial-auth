"use client";

import { useState, useCallback } from "react";
import WebcamCapture from "./WebcamCapture";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface EnrollResult {
    success: boolean;
    message?: string;
    error?: string;
}

export default function EnrollForm() {
    const [userId, setUserId] = useState("");
    const [name, setName] = useState("");
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [result, setResult] = useState<EnrollResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCapture = useCallback((base64: string) => {
        setCapturedImage(base64);
        setResult(null);
    }, []);

    async function handleEnroll() {
        if (!userId.trim() || !name.trim() || !capturedImage) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch(`${API_URL}/api/enroll`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, name, image: capturedImage }),
            });
            const data: EnrollResult = await res.json();
            setResult(data);
            if (data.success) {
                setCapturedImage(null);
                setUserId("");
                setName("");
            }
        } catch {
            setResult({ success: false, error: "Falha na comunicação com o servidor" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="userId" className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                        ID do Usuário
                    </label>
                    <input
                        id="userId"
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="ex: user-001"
                        className="w-full rounded-md border border-card-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-light focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
                        Nome
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ex: João Silva"
                        className="w-full rounded-md border border-card-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-light focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 transition-colors"
                    />
                </div>
            </div>

            <WebcamCapture onCapture={handleCapture} />

            {capturedImage && (
                <div className="flex items-center gap-2 text-sm text-success">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Imagem capturada com sucesso.
                </div>
            )}

            <button
                onClick={handleEnroll}
                disabled={!userId.trim() || !name.trim() || !capturedImage || loading}
                type="button"
                className="w-full cursor-pointer rounded-md bg-teal py-3 text-sm font-semibold text-white uppercase tracking-wide transition-colors hover:bg-teal-hover disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-teal/40"
            >
                {loading ? "Processando..." : "Cadastrar"}
            </button>

            {result && (
                <div
                    className={`rounded-md border px-4 py-3 text-sm ${result.success
                        ? "border-success/30 bg-success-light text-success"
                        : "border-danger/30 bg-danger-light text-danger"
                        }`}
                    role="alert"
                >
                    {result.success ? result.message : result.error}
                </div>
            )}
        </div>
    );
}
