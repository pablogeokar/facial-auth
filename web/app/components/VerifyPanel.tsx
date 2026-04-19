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
            <div className="flex items-center justify-between rounded-md bg-surface border border-card-border px-4 py-3">
                <span className="text-sm text-foreground font-medium">Modo contínuo</span>
                <button
                    onClick={() => setAutoMode((v) => !v)}
                    type="button"
                    className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal/40 ${autoMode ? "bg-teal" : "bg-card-border"
                        }`}
                    role="switch"
                    aria-checked={autoMode}
                    aria-label="Alternar modo de verificação contínua"
                >
                    <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${autoMode ? "translate-x-6" : "translate-x-1"
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
                <div className="flex items-center gap-2 text-sm text-teal animate-pulse">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    A verificar...
                </div>
            )}

            {result && !result.error && (
                <div
                    className={`rounded-lg border p-5 ${result.matched
                            ? "border-success/40 bg-success-light"
                            : "border-danger/40 bg-danger-light"
                        }`}
                    role="alert"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className={`flex items-center justify-center h-8 w-8 rounded-full ${result.matched ? "bg-success" : "bg-danger"
                                }`}
                        >
                            {result.matched ? (
                                <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4" aria-hidden="true">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            )}
                        </div>
                        <span className={`text-base font-semibold ${result.matched ? "text-success" : "text-danger"}`}>
                            {result.matched ? "Acesso Autorizado" : "Acesso Negado"}
                        </span>
                    </div>

                    {result.matched && result.user && (
                        <div className="space-y-1.5 text-sm ml-11">
                            <p>
                                <span className="text-muted">Utilizador:</span>{" "}
                                <span className="font-semibold text-foreground">{result.user.name}</span>
                            </p>
                            <p>
                                <span className="text-muted">ID:</span>{" "}
                                <span className="font-mono text-xs text-foreground">{result.user.id}</span>
                            </p>
                            {result.distance !== null && (
                                <p>
                                    <span className="text-muted">Distância:</span>{" "}
                                    <span className="font-mono text-xs text-foreground">
                                        {result.distance.toFixed(4)}
                                    </span>
                                </p>
                            )}
                        </div>
                    )}

                    {result.livenessScore !== null && (
                        <p className="mt-3 ml-11 text-xs text-muted">
                            Liveness: {(result.livenessScore * 100).toFixed(0)}%
                        </p>
                    )}
                </div>
            )}

            {result?.error && (
                <div
                    className="rounded-md border border-danger/30 bg-danger-light px-4 py-3 text-sm text-danger"
                    role="alert"
                >
                    {result.error}
                </div>
            )}
        </div>
    );
}
