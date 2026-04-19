import type { FastifyInstance } from "fastify";
import { generateEmbedding } from "../services/faceService.js";
import { userStore } from "../store.js";
import type { EnrollRequest, EnrollResponse, ErrorResponse } from "../types.js";

export async function enrollRoutes(app: FastifyInstance): Promise<void> {
    app.post<{ Body: EnrollRequest; Reply: EnrollResponse | ErrorResponse }>(
        "/api/enroll",
        async (request, reply) => {
            const { userId, name, image } = request.body;

            if (!userId || !name || !image) {
                return reply.status(400).send({
                    success: false,
                    error: "Campos obrigatórios não informados: userId, name, image",
                });
            }

            if (userStore.exists(userId)) {
                return reply.status(409).send({
                    success: false,
                    error: `O usuário "${userId}" já está cadastrado`,
                });
            }

            try {
                const { descriptor, livenessScore } = await generateEmbedding(image);

                if (livenessScore < 0.5) {
                    return reply.status(422).send({
                        success: false,
                        error: "Verificação de vivacidade falhou. Utilize uma captura ao vivo da câmera.",
                    });
                }

                userStore.add({
                    id: userId,
                    name,
                    descriptor: Array.from(descriptor),
                    enrolledAt: new Date().toISOString(),
                    status: "ATIVO",
                });

                return reply.status(201).send({
                    success: true,
                    userId,
                    message: `Usuário "${name}" cadastrado com sucesso`,
                });
            } catch (err) {
                const message = err instanceof Error ? err.message : "Unknown error";

                if (message === "NO_FACE_DETECTED") {
                    return reply.status(422).send({
                        success: false,
                        error: "Nenhum rosto detectado na imagem",
                    });
                }
                if (message === "MULTIPLE_FACES_DETECTED") {
                    return reply.status(422).send({
                        success: false,
                        error: "Múltiplos rostos detectados. Envie uma imagem com apenas um rosto.",
                    });
                }

                request.log.error(err, "Enrollment failed");
                return reply.status(500).send({
                    success: false,
                    error: "Erro interno do servidor ao realizar o cadastro",
                });
            }
        }
    );
}
