import type { FastifyInstance } from "fastify";
import { userStore } from "../store.js";
import type { UserStatus, ErrorResponse } from "../types.js";

const VALID_STATUSES: UserStatus[] = ["ATIVO", "INATIVO", "BLOQUEADO"];

export async function usersRoutes(app: FastifyInstance): Promise<void> {
    // List all users (without descriptor for security/performance)
    app.get("/api/users", async () => {
        const users = userStore.getAll().map(({ descriptor: _, ...rest }) => rest);
        return { users };
    });

    // Update a user (name and/or status)
    app.patch<{
        Params: { id: string };
        Body: { name?: string; status?: UserStatus; observation?: string };
        Reply: { success: boolean; user?: Record<string, unknown> } | ErrorResponse;
    }>("/api/users/:id", async (request, reply) => {
        const { id } = request.params;
        const { name, status, observation } = request.body;

        if (!name && !status && observation === undefined) {
            return reply.status(400).send({
                success: false,
                error: "Informe ao menos um campo para atualizar: name, status, observation",
            });
        }

        if (status && !VALID_STATUSES.includes(status)) {
            return reply.status(400).send({
                success: false,
                error: `Status inválido. Deve ser um dos seguintes: ${VALID_STATUSES.join(", ")}`,
            });
        }

        const updated = userStore.update(id, { name, status, observation });

        if (!updated) {
            return reply.status(404).send({
                success: false,
                error: `Usuário "${id}" não encontrado`,
            });
        }

        const { descriptor: _, ...safe } = updated;
        return { success: true, user: safe };
    });

    // Delete a user
    app.delete<{
        Params: { id: string };
        Reply: { success: boolean; message: string } | ErrorResponse;
    }>("/api/users/:id", async (request, reply) => {
        const { id } = request.params;

        const deleted = userStore.delete(id);

        if (!deleted) {
            return reply.status(404).send({
                success: false,
                error: `Usuário "${id}" não encontrado`,
            });
        }

        return { success: true, message: `Usuário "${id}" excluído com sucesso` };
    });
}
