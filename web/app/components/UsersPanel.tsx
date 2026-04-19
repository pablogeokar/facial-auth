"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type UserStatus = "ATIVO" | "INATIVO" | "BLOQUEADO";

interface UserItem {
    id: string;
    name: string;
    enrolledAt: string;
    status: UserStatus;
}

const STATUS_STYLES: Record<UserStatus, string> = {
    ATIVO: "bg-success-light text-success",
    INATIVO: "bg-amber-50 text-amber-600",
    BLOQUEADO: "bg-danger-light text-danger",
};

export default function UsersPanel() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setError(null);
            const res = await fetch(`${API_URL}/api/users`);
            const data = await res.json();
            setUsers(data.users ?? []);
        } catch {
            setError("Falha ao carregar usuários.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    async function updateUser(id: string, body: { name?: string; status?: UserStatus }) {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/users/${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) {
                await fetchUsers();
                setEditingId(null);
                setError(null);
            } else {
                setError(data.error ?? "Falha ao atualizar usuário.");
            }
        } catch {
            setError("Falha na comunicação com o servidor.");
        } finally {
            setSaving(false);
        }
    }

    function startEdit(user: UserItem) {
        setEditingId(user.id);
        setEditName(user.name);
    }

    function cancelEdit() {
        setEditingId(null);
        setEditName("");
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-muted">
                Carregando usuários...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-md border border-danger/30 bg-danger-light px-4 py-3 text-sm text-danger" role="alert">
                {error}
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 mb-3 text-muted-light" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2 2 0 0 1 3.24 17.5a4.125 4.125 0 0 1 7.533-2.493M15 19.128a9.38 9.38 0 0 1-2.625.372m0 0a9.337 9.337 0 0 1-4.121-.952M12.513 16.056A9.38 9.38 0 0 1 9.878 13m2.635 3.056a9.337 9.337 0 0 0 2.108-2.683" />
                </svg>
                Nenhum usuário cadastrado.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="text-xs text-muted font-medium uppercase tracking-wide mb-2">
                {users.length} usuário{users.length !== 1 ? "s" : ""} cadastrado{users.length !== 1 ? "s" : ""}
            </div>

            <div className="divide-y divide-card-border rounded-lg border border-card-border overflow-hidden">
                {users.map((user) => (
                    <div key={user.id} className="bg-white px-4 py-3">
                        {editingId === user.id ? (
                            /* Edit mode */
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor={`edit-name-${user.id}`} className="block text-xs font-semibold text-foreground mb-1 uppercase tracking-wide">
                                        Nome
                                    </label>
                                    <input
                                        id={`edit-name-${user.id}`}
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full rounded-md border border-card-border bg-surface px-3 py-2 text-sm text-foreground focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 transition-colors"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateUser(user.id, { name: editName })}
                                        disabled={!editName.trim() || saving}
                                        type="button"
                                        className="cursor-pointer rounded-md bg-teal px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-wide transition-colors hover:bg-teal-hover disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Salvar
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        type="button"
                                        className="cursor-pointer rounded-md border border-card-border px-4 py-1.5 text-xs font-semibold text-muted uppercase tracking-wide transition-colors hover:bg-surface"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* View mode */
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-semibold text-foreground truncate">{user.name}</span>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[user.status] ?? STATUS_STYLES.ATIVO}`}>
                                            {user.status}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-light font-mono">{user.id}</span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    {/* Edit name button */}
                                    <button
                                        onClick={() => startEdit(user)}
                                        type="button"
                                        title="Editar nome"
                                        className="cursor-pointer rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
                                    >
                                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                                            <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                                        </svg>
                                    </button>

                                    {/* Status select */}
                                    <select
                                        value={user.status}
                                        onChange={(e) => updateUser(user.id, { status: e.target.value as UserStatus })}
                                        disabled={saving}
                                        className="cursor-pointer rounded-md border border-card-border bg-surface px-2 py-1 text-xs font-medium text-foreground focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 transition-colors disabled:opacity-40"
                                    >
                                        <option value="ATIVO">ATIVO</option>
                                        <option value="INATIVO">INATIVO</option>
                                        <option value="BLOQUEADO">BLOQUEADO</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
