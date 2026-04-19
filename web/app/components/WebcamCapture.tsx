"use client";

import { useRef, useCallback, useEffect, useState } from "react";

interface WebcamCaptureProps {
    onCapture: (base64: string) => void;
    autoCapture?: boolean;
    autoCaptureInterval?: number;
}

export default function WebcamCapture({
    onCapture,
    autoCapture = false,
    autoCaptureInterval = 2000,
}: WebcamCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [streaming, setStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;

        async function startCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: "user" },
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStreaming(true);
                }
            } catch {
                setError("Não foi possível aceder à câmara. Verifique as permissões.");
            }
        }

        startCamera();

        return () => {
            stream?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const capture = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
        if (base64) onCapture(base64);
    }, [onCapture]);

    // Auto-capture interval for verification mode
    useEffect(() => {
        if (!autoCapture || !streaming) return;
        const id = setInterval(capture, autoCaptureInterval);
        return () => clearInterval(id);
    }, [autoCapture, streaming, capture, autoCaptureInterval]);

    return (
        <div className="relative">
            {error ? (
                <div className="flex items-center justify-center h-[360px] rounded-xl bg-card border border-card-border text-danger text-sm px-6 text-center">
                    {error}
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full rounded-xl border border-card-border"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    {!autoCapture && streaming && (
                        <button
                            onClick={capture}
                            type="button"
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50"
                        >
                            Capturar
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
