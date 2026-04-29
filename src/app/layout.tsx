import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import { SpeedInsights } from "@vercel/speed-insights/next";
// import OfflineStatus from "@/components/OfflineStatus";
import "@/lib/consoleUtils"; // Initialize console utilities

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpulFlow - Sales Intelligence Platform",
  description: "Modern sales intelligence with beautiful onboarding, auth, and analytics.",
  verification: {
    google: "google8c17f0e170a2d62b.html",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        type: "image/svg+xml",
        sizes: "any",
        url: "/favicon.svg",
      },
    ],
  },
  openGraph: {
    title: "OpulFlow",
    description: "AI-powered business and CRM platform",
    images: ["/og-image.svg"],
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
        <SpeedInsights />
        {/* <OfflineStatus /> */}
      </body>
    </html>
  );
}