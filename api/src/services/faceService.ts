// Use the WASM-backed node bundle (avoids @tensorflow/tfjs-node which breaks on Node 25+)
import "@tensorflow/tfjs-backend-wasm";
import * as tf from "@tensorflow/tfjs";
await tf.ready();

import * as faceapi from "@vladmandic/face-api/dist/face-api.node-wasm.js";
import { Canvas, Image, ImageData, createCanvas, loadImage } from "canvas";
import { config } from "../config.js";
import { userStore } from "../store.js";
import type { RecognitionResult } from "../types.js";

// Patch face-api to use node-canvas
faceapi.env.monkeyPatch({
    Canvas: Canvas as unknown as typeof HTMLCanvasElement,
    Image: Image as unknown as typeof HTMLImageElement,
    ImageData: ImageData as unknown as typeof globalThis.ImageData,
    createCanvasElement: () => createCanvas(1, 1) as unknown as HTMLCanvasElement,
    createImageElement: () => new Image() as unknown as HTMLImageElement,
});

let modelsLoaded = false;

/**
 * Load face-api.js neural network models (singleton).
 */
export async function loadModels(): Promise<void> {
    if (modelsLoaded) return;

    const modelsPath = config.modelsPath;
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);

    modelsLoaded = true;
    console.log("[FaceService] Models loaded from", modelsPath);
}

/**
 * Decode a base64 image string into a canvas-compatible input.
 */
async function decodeImage(base64: string): Promise<Image> {
    const buffer = Buffer.from(
        base64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
    );
    return loadImage(buffer) as Promise<Image>;
}

/**
 * Detect all faces in an image and return full descriptions.
 */
async function detectFaces(img: Image) {
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const input = canvas as unknown as HTMLCanvasElement;
    return faceapi
        .detectAllFaces(input)
        .withFaceLandmarks()
        .withFaceDescriptors();
}

/**
 * Simple liveness heuristic based on facial landmark proportions.
 * Returns a score between 0 (likely spoof) and 1 (likely real).
 */
function computeLivenessScore(landmarks: faceapi.FaceLandmarks68): number {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const jaw = landmarks.getJawOutline();

    const leftCenter = {
        x: leftEye.reduce((s, p) => s + p.x, 0) / leftEye.length,
        y: leftEye.reduce((s, p) => s + p.y, 0) / leftEye.length,
    };
    const rightCenter = {
        x: rightEye.reduce((s, p) => s + p.x, 0) / rightEye.length,
        y: rightEye.reduce((s, p) => s + p.y, 0) / rightEye.length,
    };

    const interEyeDist = Math.sqrt(
        (rightCenter.x - leftCenter.x) ** 2 + (rightCenter.y - leftCenter.y) ** 2
    );

    const jawLeft = jaw[0]!;
    const jawRight = jaw[jaw.length - 1]!;
    const faceWidth = Math.sqrt(
        (jawRight.x - jawLeft.x) ** 2 + (jawRight.y - jawLeft.y) ** 2
    );

    const ratio = interEyeDist / faceWidth;
    if (ratio < 0.2 || ratio > 0.6) return 0.2;
    if (ratio >= 0.3 && ratio <= 0.5) return 0.95;
    return 0.6;
}

/**
 * Generate a 128-dimension face embedding from a base64 image.
 * Throws if zero or more than one face is detected.
 */
export async function generateEmbedding(
    base64Image: string
): Promise<{ descriptor: Float32Array; livenessScore: number }> {
    const img = await decodeImage(base64Image);
    const detections = await detectFaces(img);

    if (detections.length === 0) {
        throw new Error("NO_FACE_DETECTED");
    }
    if (detections.length > 1) {
        throw new Error("MULTIPLE_FACES_DETECTED");
    }

    const detection = detections[0]!;
    const livenessScore = computeLivenessScore(detection.landmarks);
    return { descriptor: detection.descriptor, livenessScore };
}

/**
 * Compare a probe face against all enrolled users.
 * Returns the best match if distance < threshold.
 */
export async function verifyFace(
    base64Image: string
): Promise<RecognitionResult> {
    const { descriptor: probeDescriptor, livenessScore } =
        await generateEmbedding(base64Image);

    const users = userStore.getAll();
    if (users.length === 0) {
        return { matched: false, user: null, distance: null, livenessScore };
    }

    let bestMatch: {
        userId: string;
        name: string;
        distance: number;
    } | null = null;

    for (const user of users) {
        const enrolled = new Float32Array(user.descriptor);
        const distance = faceapi.euclideanDistance(
            Array.from(probeDescriptor),
            Array.from(enrolled)
        );

        if (distance < config.matchThreshold) {
            if (!bestMatch || distance < bestMatch.distance) {
                bestMatch = { userId: user.id, name: user.name, distance };
            }
        }
    }

    if (bestMatch) {
        return {
            matched: true,
            user: { id: bestMatch.userId, name: bestMatch.name },
            distance: bestMatch.distance,
            livenessScore,
        };
    }

    return { matched: false, user: null, distance: null, livenessScore };
}
