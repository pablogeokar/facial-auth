import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://facial-auth.vercel.app"
  ),
  title: "FaceGuard — Controle de Acesso Facial",
  description:
    "Sistema de controle de acesso com reconhecimento facial em tempo real. Cadastro, verificação e gestão de usuários com face-api.js e TensorFlow.js.",
  openGraph: {
    title: "FaceGuard — Controle de Acesso Facial",
    description:
      "Sistema de controle de acesso com reconhecimento facial em tempo real. Cadastro, verificação e gestão de usuários.",
    siteName: "FaceGuard",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://facial-auth.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "FaceGuard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FaceGuard — Controle de Acesso Facial",
    description:
      "Sistema de controle de acesso com reconhecimento facial em tempo real.",
    images: ["https://facial-auth.vercel.app/og-image.png"],
  },
  other: {
    "msapplication-TileColor": "#003770",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#003770",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
