import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const modelsDir = resolve(__dirname, "..", "models");

const BASE =
    "https://raw.githubusercontent.com/vladmandic/face-api/master/model";

const files = [
    "ssd_mobilenetv1_model-weights_manifest.json",
    "ssd_mobilenetv1_model.bin",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model.bin",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model.bin",
];

async function download() {
    if (!existsSync(modelsDir)) {
        mkdirSync(modelsDir, { recursive: true });
    }

    for (const file of files) {
        const url = `${BASE}/${file}`;
        const dest = resolve(modelsDir, file);

        if (existsSync(dest)) {
            console.log(`[skip] ${file}`);
            continue;
        }

        console.log(`[download] ${file}...`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to download ${file}: ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        writeFileSync(dest, buf);
        console.log(`[done] ${file} (${(buf.length / 1024).toFixed(0)} KB)`);
    }

    console.log("\nAll models downloaded to:", modelsDir);
}

download().catch((err) => {
    console.error("Download failed:", err);
    process.exit(1);
});
