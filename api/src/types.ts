export interface AppConfig {
    port: number;
    host: string;
    matchThreshold: number;
    modelsPath: string;
}

export interface User {
    id: string;
    name: string;
    descriptor: number[];
    enrolledAt: string;
}

export interface RecognitionResult {
    matched: boolean;
    user: Pick<User, "id" | "name"> | null;
    distance: number | null;
    livenessScore: number | null;
}

export interface EnrollRequest {
    userId: string;
    name: string;
    image: string; // base64
}

export interface VerifyRequest {
    image: string; // base64
}

export interface EnrollResponse {
    success: boolean;
    userId: string;
    message: string;
}

export interface ErrorResponse {
    success: false;
    error: string;
}
