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
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="userId" className="block text-xs font-medium text-muted mb-1.5">
                        ID do Utilizador
                    </label>
                    <input
                        id="userId"
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="ex: user-001"
                        className="w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    />
                </div>
                <div>
                    <label htmlFor="name" className="block text-xs font-medium text-muted mb-1.5">
                        Nome
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ex: João Silva"
                        className="w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    />
                </div>
            </div>

            <WebcamCapture onCapture={handleCapture} />

            {capturedImage && (
                <p className="text-xs text-success">Imagem capturada com sucesso.</p>
            )}

            <button
                onClick={handleEnroll}
                disabled={!userId.trim() || !name.trim() || !capturedImage || loading}
                type="button"
                className="w-full cursor-pointer rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
                {loading ? "A processar..." : "Cadastrar Utilizador"}
            </button>

            {result && (
                <div
                    className={`rounded-lg border px-4 py-3 text-sm ${result.success
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-danger/30 bg-danger/10 text-danger"
                        }`}
                    role="alert"
                >
                    {result.success ? result.message : result.error}
                </div>
            )}
        </div>
    );
}
