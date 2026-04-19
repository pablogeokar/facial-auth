"use client";

import { useState, useCallback, useRef } from "react";
import WebcamCapture from "./WebcamCapture";
import BlockedDialog from "./BlockedDialog";
import SuspendedDialog from "./SuspendedDialog";
import AccessGrantedDialog from "./AccessGrantedDialog";
import AccessDeniedDialog from "./AccessDeniedDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface VerifyResult {
    matched: boolean;
    user: { id: string; name: string } | null;
    distance: number | null;
    livenessScore: number | null;
    blocked?: boolean;
    inactive?: boolean;
    error?: string;
}

type DialogState =
    | { type: "none" }
    | { type: "granted"; userName: string; userId: string }
    | { type: "denied" }
    | { type: "blocked"; userName: string }
    | { type: "suspended"; userName: string }
    | { type: "error"; message: string };

export default function VerifyPanel() {
    const [loading, setLoading] = useState(false);
    const [autoMode, setAutoMode] = useState(false);
    const [dialog, setDialog] = useState<DialogState>({ type: "none" });
    const busyRef = useRef(false);

    const closeDialog = useCallback(() => setDialog({ type: "none" }), []);

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
            const data: VerifyResult = await res.json();

            if (data.blocked && data.user) {
                setDialog({ type: "blocked", userName: data.user.name });
            } else if (data.inactive && data.user) {
                setDialog({ type: "suspended", userName: data.user.name });
            } else if (data.matched && data.user) {
                setDialog({ type: "granted", userName: data.user.name, userId: data.user.id });
            } else if (data.error) {
                setDialog({ type: "error", message: data.error });
            } else {
                setDialog({ type: "denied" });
            }
        } catch {
            setDialog({ type: "error", message: "Falha na comunicação com o servidor" });
        } finally {
            setLoading(false);
            busyRef.current = false;
        }
    }, []);

    return (
        <div className="space-y-5">
            {/* Dialogs */}
            <AccessGrantedDialog
                open={dialog.type === "granted"}
                userName={dialog.type === "granted" ? dialog.userName : ""}
                userId={dialog.type === "granted" ? dialog.userId : ""}
                onClose={closeDialog}
            />
            <AccessDeniedDialog
                open={dialog.type === "denied"}
                onClose={closeDialog}
            />
            <BlockedDialog
                open={dialog.type === "blocked"}
                userName={dialog.type === "blocked" ? dialog.userName : ""}
                onClose={closeDialog}
            />
            <SuspendedDialog
                open={dialog.type === "suspended"}
                userName={dialog.type === "suspended" ? dialog.userName : ""}
                onClose={closeDialog}
            />

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

            {dialog.type === "error" && (
                <div
                    className="rounded-md border border-danger/30 bg-danger-light px-4 py-3 text-sm text-danger"
                    role="alert"
                >
                    {dialog.message}
                </div>
            )}
        </div>
    );
}
