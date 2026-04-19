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
                setError("Não foi possível carregar à câmera. Verifique as permissões.");
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

    useEffect(() => {
        if (!autoCapture || !streaming) return;
        const id = setInterval(capture, autoCaptureInterval);
        return () => clearInterval(id);
    }, [autoCapture, streaming, capture, autoCaptureInterval]);

    return (
        <div className="relative">
            {error ? (
                <div className="flex items-center justify-center h-[360px] rounded-xl bg-surface/50 border border-card-border/60 shadow-inner text-muted text-[15px] px-6 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-muted-light opacity-80" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        {error}
                    </div>
                </div>
            ) : (
                <>
                    <div className="overflow-hidden rounded-lg border-2 border-card-border bg-foreground/5">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full block"
                        />
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    {!autoCapture && streaming && (
                        <button
                            onClick={capture}
                            type="button"
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 cursor-pointer rounded-md bg-teal px-6 py-2.5 text-sm font-semibold text-white uppercase tracking-wide shadow-lg transition-colors hover:bg-teal-hover focus:outline-none focus:ring-2 focus:ring-teal/40"
                        >
                            Capturar
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
