"use client";

import { useEffect, useRef } from "react";

interface AccessGrantedDialogProps {
    open: boolean;
    userName: string;
    userId: string;
    onClose: () => void;
}

export default function AccessGrantedDialog({ open, userName, userId, onClose }: AccessGrantedDialogProps) {
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
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#00b39c" strokeWidth={1.5} className="h-8 w-8" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-foreground mb-2">
                    Acesso Autorizado
                </h2>

                {/* User info */}
                <p className="text-sm text-muted leading-relaxed mb-1">
                    Bem-vindo, <span className="font-semibold text-foreground">{userName}</span>
                </p>
                <p className="text-xs text-muted-light font-mono mb-6">{userId}</p>

                {/* Divider */}
                <div className="border-t border-card-border pt-4">
                    <button
                        onClick={onClose}
                        type="button"
                        className="cursor-pointer rounded-md px-8 py-2.5 text-sm font-semibold text-white uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-success/40"
                        style={{ backgroundColor: "#00b39c" }}
                    >
                        Continuar
                    </button>
                </div>
            </div>
        </dialog>
    );
}
