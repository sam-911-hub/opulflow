import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import CookieConsent from "@/components/CookieConsent";
// import OfflineStatus from "@/components/OfflineStatus";
import "@/lib/consoleUtils"; // Initialize console utilities

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpulFlow - Professional Social Media Marketing Services",
  description: "Boost your online presence with expert comment writing, influencer outreach, product reviews, and AI content humanization. Trusted by businesses worldwide.",
  keywords: "social media marketing, buy social media comments, influencer research, product reviews, AI content humanization, online reputation management",
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
    title: "OpulFlow - Professional Social Media Marketing Services",
    description: "Boost your online presence with expert comment writing, influencer outreach, product reviews, and AI content humanization.",
    images: ["/og-image.svg"],
    url: "https://opulflow.top",
    siteName: "OpulFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpulFlow - Professional Social Media Marketing Services",
    description: "Boost your online presence with expert comment writing, influencer outreach, product reviews, and AI content humanization.",
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
        <CookieConsent />
        {/* <OfflineStatus /> */}
      </body>
    </html>
  );
}