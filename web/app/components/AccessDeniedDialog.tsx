"use client";

import { useEffect, useRef } from "react";

interface AccessDeniedDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function AccessDeniedDialog({ open, onClose }: AccessDeniedDialogProps) {
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-foreground mb-2">
                    Acesso Negado
                </h2>

                {/* Message */}
                <p className="text-sm text-muted leading-relaxed mb-6">
                    Não foi possível identificar o usuário. Verifique se você está cadastrado no sistema ou procure a <span className="font-semibold text-foreground">secretaria</span>.
                </p>

                {/* Divider */}
                <div className="border-t border-card-border pt-4">
                    <button
                        onClick={onClose}
                        type="button"
                        className="cursor-pointer rounded-md px-8 py-2.5 text-sm font-semibold text-white uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-teal/40"
                        style={{ backgroundColor: "#0c9abe" }}
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        </dialog>
    );
}
