import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { loadModels } from "./services/faceService.js";
import { enrollRoutes } from "./routes/enroll.js";
import { verifyRoutes } from "./routes/verify.js";
import { usersRoutes } from "./routes/users.js";
import { userStore } from "./store.js";

const app = Fastify({
    logger: true,
    bodyLimit: 10 * 1024 * 1024, // 10 MB for base64 images
});

// CORS — allow any origin (tighten in production if needed)
await app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

// Health check
app.get("/api/health", async () => ({
    status: "success",
    message: "Tudo certo! A API de Autenticação Facial está funcionando perfeitamente. 🚀",
    enrolledUsers: userStore.count(),
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
}));

// Register routes
app.register(enrollRoutes);
app.register(verifyRoutes);
app.register(usersRoutes);

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
