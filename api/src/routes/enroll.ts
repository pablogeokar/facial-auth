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
                    error: "Missing required fields: userId, name, image",
                });
            }

            if (userStore.exists(userId)) {
                return reply.status(409).send({
                    success: false,
                    error: `User "${userId}" is already enrolled`,
                });
            }

            try {
                const { descriptor, livenessScore } = await generateEmbedding(image);

                if (livenessScore < 0.5) {
                    return reply.status(422).send({
                        success: false,
                        error: "Liveness check failed. Please use a live camera capture.",
                    });
                }

                userStore.add({
                    id: userId,
                    name,
                    descriptor: Array.from(descriptor),
                    enrolledAt: new Date().toISOString(),
                });

                return reply.status(201).send({
                    success: true,
                    userId,
                    message: `User "${name}" enrolled successfully`,
                });
            } catch (err) {
                const message = err instanceof Error ? err.message : "Unknown error";

                if (message === "NO_FACE_DETECTED") {
                    return reply.status(422).send({
                        success: false,
                        error: "No face detected in the image",
                    });
                }
                if (message === "MULTIPLE_FACES_DETECTED") {
                    return reply.status(422).send({
                        success: false,
                        error: "Multiple faces detected. Please provide an image with exactly one face.",
                    });
                }

                request.log.error(err, "Enrollment failed");
                return reply.status(500).send({
                    success: false,
                    error: "Internal server error during enrollment",
                });
            }
        }
    );
}
