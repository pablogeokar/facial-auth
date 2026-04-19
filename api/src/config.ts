import type { AppConfig } from "./types.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config: AppConfig = {
    port: Number(process.env["PORT"] ?? 3001),
    host: process.env["HOST"] ?? "0.0.0.0",
    matchThreshold: 0.45,
    modelsPath: path.resolve(__dirname, "..", "models"),
};
