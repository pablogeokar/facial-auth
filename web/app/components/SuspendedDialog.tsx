"use client";

import { useEffect, useRef } from "react";

interface SuspendedDialogProps {
    open: boolean;
    userName: string;
    onClose: () => void;
}

export default function SuspendedDialog({ open, userName, onClose }: SuspendedDialogProps) {
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
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={1.5} className="h-8 w-8" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-foreground mb-2">
                    Acesso Suspenso
                </h2>

                {/* Message */}
                <p className="text-sm text-muted leading-relaxed mb-1">
                    O usuário <span className="font-semibold text-foreground">{userName}</span> está com o acesso temporariamente <span className="font-semibold text-amber-600">INATIVO</span>.
                </p>
                <p className="text-sm text-muted leading-relaxed mb-6">
                    Por favor, procure a <span className="font-semibold text-foreground">secretaria</span> para reativar seu cadastro.
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
