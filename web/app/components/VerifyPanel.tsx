"use client";

import { useState, useCallback, useRef } from "react";
import WebcamCapture from "./WebcamCapture";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface VerifyResult {
    matched: boolean;
    user: { id: string; name: string } | null;
    distance: number | null;
    livenessScore: number | null;
    error?: string;
}

export default function VerifyPanel() {
    const [result, setResult] = useState<VerifyResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [autoMode, setAutoMode] = useState(false);
    const busyRef = useRef(false);

    const handleCapture = useCallback(async (base64: string) => {
        if (busyRef.current) return;
        busyRef.current = true;
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64 }),
            });
            const data = await res.json();
            setResult(data);
        } catch {
            setResult({
                matched: false,
                user: null,
                distance: null,
                livenessScore: null,
                error: "Falha na comunicação com o servidor",
            });
        } finally {
            setLoading(false);
            busyRef.current = false;
        }
    }, []);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Modo contínuo</span>
                <button
                    onClick={() => setAutoMode((v) => !v)}
                    type="button"
                    className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${autoMode ? "bg-accent" : "bg-card-border"
                        }`}
                    role="switch"
                    aria-checked={autoMode}
                    aria-label="Alternar modo de verificação contínua"
                >
                    <span
                        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${autoMode ? "translate-x-6" : "translate-x-1"
                            }`}
                    />
                </button>
            </div>

            <WebcamCapture
                onCapture={handleCapture}
                autoCapture={autoMode}
                autoCaptureInterval={3000}
            />

            {loading && (
                <p className="text-xs text-muted animate-pulse">A verificar...</p>
            )}

            {result && !result.error && (
                <div
                    className={`rounded-xl border p-5 ${result.matched
                            ? "border-success/30 bg-success/5"
                            : "border-danger/30 bg-danger/5"
                        }`}
                    role="alert"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className={`h-3 w-3 rounded-full ${result.matched ? "bg-success" : "bg-danger"
                                }`}
                        />
                        <span className="text-sm font-semibold">
                            {result.matched ? "Acesso Autorizado" : "Acesso Negado"}
                        </span>
                    </div>

                    {result.matched && result.user && (
                        <div className="space-y-1 text-sm">
                            <p>
                                <span className="text-muted">Utilizador:</span>{" "}
                                <span className="font-medium">{result.user.name}</span>
                            </p>
                            <p>
                                <span className="text-muted">ID:</span>{" "}
                                <span className="font-mono text-xs">{result.user.id}</span>
                            </p>
                            {result.distance !== null && (
                                <p>
                                    <span className="text-muted">Distância:</span>{" "}
                                    <span className="font-mono text-xs">
                                        {result.distance.toFixed(4)}
                                    </span>
                                </p>
                            )}
                        </div>
                    )}

                    {result.livenessScore !== null && (
                        <p className="mt-2 text-xs text-muted">
                            Liveness: {(result.livenessScore * 100).toFixed(0)}%
                        </p>
                    )}
                </div>
            )}

            {result?.error && (
                <div
                    className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
                    role="alert"
                >
                    {result.error}
                </div>
            )}
        </div>
    );
}
