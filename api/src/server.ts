import Fastify from "fastify";
import { config } from "./config.js";
import { loadModels } from "./services/faceService.js";
import { enrollRoutes } from "./routes/enroll.js";
import { verifyRoutes } from "./routes/verify.js";
import { userStore } from "./store.js";

const app = Fastify({
    logger: true,
    bodyLimit: 10 * 1024 * 1024, // 10 MB for base64 images
});

// CORS for local dev
app.addHook("onRequest", async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type");
    if (request.method === "OPTIONS") {
        return reply.status(204).send();
    }
});

// Health check
app.get("/api/health", async () => ({
    status: "ok",
    enrolledUsers: userStore.count(),
}));

// Register routes
app.register(enrollRoutes);
app.register(verifyRoutes);

async function start(): Promise<void> {
    try {
        console.log("[Server] Loading face-api.js models...");
        await loadModels();
        console.log("[Server] Models ready.");

        await app.listen({ port: config.port, host: config.host });
        console.log(`[Server] Listening on http://${config.host}:${config.port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

start();
