import type { FastifyInstance } from "fastify";
import { verifyFace } from "../services/faceService.js";
import { userStore } from "../store.js";
import type { RecognitionResult, VerifyRequest, ErrorResponse } from "../types.js";

export async function verifyRoutes(app: FastifyInstance): Promise<void> {
    app.post<{ Body: VerifyRequest; Reply: RecognitionResult | ErrorResponse }>(
        "/api/verify",
        async (request, reply) => {
            const { image } = request.body;

            if (!image) {
                return reply.status(400).send({
                    success: false,
                    error: "Campo obrigatório não informado: image",
                });
            }

            try {
                const result = await verifyFace(image);

                if (result.livenessScore !== null && result.livenessScore < 0.5) {
                    return reply.status(403).send({
                        success: false,
                        error: "Verificação de vivacidade falhou. Possível tentativa de fraude detectada.",
                    });
                }

                // Check user status when matched
                if (result.matched && result.user) {
                    const user = userStore.getById(result.user.id);
                    if (user) {
                        if (user.status === "BLOQUEADO") {
                            return reply.status(403).send({
                                matched: true,
                                user: { id: user.id, name: user.name },
                                distance: result.distance,
                                livenessScore: result.livenessScore,
                                blocked: true,
                            });
                        }
                        if (user.status === "INATIVO") {
                            return reply.status(403).send({
                                matched: true,
                                user: { id: user.id, name: user.name },
                                distance: result.distance,
                                livenessScore: result.livenessScore,
                                inactive: true,
                            });
                        }
                    }
                }

                return reply.status(result.matched ? 200 : 401).send(result);
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
                        error: "Múltiplos rostos detectados. Apenas um rosto é permitido por captura.",
                    });
                }

                request.log.error(err, "Verification failed");
                return reply.status(500).send({
                    success: false,
                    error: "Erro interno do servidor ao realizar a verificação",
                });
            }
        }
    );
}
