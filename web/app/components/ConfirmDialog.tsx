"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = "Excluir",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
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
            onClose={onCancel}
            className="rounded-xl border border-card-border bg-white p-0 shadow-2xl backdrop:bg-black/50 max-w-sm w-[90vw]"
        >
            <div className="p-6 text-center">
                {/* Warning icon */}
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={1.5} className="h-7 w-7" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                </div>

                <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
                <p className="text-sm text-muted leading-relaxed mb-6">{message}</p>

                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={onCancel}
                        type="button"
                        className="cursor-pointer rounded-md border border-card-border px-5 py-2 text-sm font-semibold text-muted uppercase tracking-wide transition-colors hover:bg-surface"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        type="button"
                        className="cursor-pointer rounded-md bg-danger px-5 py-2 text-sm font-semibold text-white uppercase tracking-wide transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-danger/40"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    );
}
