"use client";

import { useEffect, useRef } from "react";

interface BlockedDialogProps {
    open: boolean;
    userName: string;
    observation?: string | null;
    onClose: () => void;
}

export default function BlockedDialog({ open, userName, observation, onClose }: BlockedDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const el = dialogRef.current;
        if (!el) return;
        if (open && !el.open) el.showModal();
        if (!open && el.open) el.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            className="rounded-xl border border-card-border bg-white p-0 shadow-2xl backdrop:bg-black/50 max-w-md w-[90vw]"
        >
            <div className="p-6 text-center">
                {/* Icon */}
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger-light">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={1.5} className="h-8 w-8" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-foreground mb-2">
                    Acesso Bloqueado
                </h2>

                {/* Message */}
                <p className="text-sm text-muted leading-relaxed mb-1">
                    O usuário <span className="font-semibold text-foreground">{userName}</span> está com o acesso <span className="font-semibold text-danger">BLOQUEADO</span>.
                </p>

                {/* Observation */}
                {observation && (
                    <div className="my-4 mx-auto max-w-sm rounded-md bg-danger-light border border-danger/20 px-4 py-3 text-left">
                        <div className="flex items-start gap-2">
                            <svg viewBox="0 0 20 20" fill="#ef4444" className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true">
                                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <span className="text-xs font-semibold text-danger uppercase tracking-wide">Motivo</span>
                                <p className="text-sm text-foreground leading-relaxed mt-0.5">{observation}</p>
                            </div>
                        </div>
                    </div>
                )}

                <p className="text-sm text-muted leading-relaxed mb-6">
                    Por favor, procure a <span className="font-semibold text-foreground">secretaria</span> para regularizar sua situação.
                </p>

                {/* Divider */}
                <div className="border-t border-card-border pt-4">
                    <button
                        onClick={onClose}
                        type="button"
                        className="cursor-pointer rounded-md px-8 py-2.5 text-sm font-semibold text-white uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-teal/40"
                        style={{ backgroundColor: "#0c9abe" }}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </dialog>
    );
}
