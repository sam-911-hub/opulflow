import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import OfflineStatus from "@/components/OfflineStatus";
import "@/lib/consoleUtils"; // Initialize console utilities

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpulFlow - Sales Intelligence Platform",
  description: "Next-gen sales tools for modern teams",
  verification: {
    google: "google8c17f0e170a2d62b.html",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/favicon-16x16.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "64x64",
        url: "/favicon-64x64.png",
      },
    ],
  },
  openGraph: {
    title: "OpulFlow",
    description: "AI-powered business and CRM platform",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="m5CQznjCXSJfkMqq2f5gMPAIsymc7W2RTFembw8xwyc" />
      </head>
      <body className={inter.className}>
        <Header />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Footer />
        <Toaster />
        <OfflineStatus />
      </body>
    </html>
  );
}