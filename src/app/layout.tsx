import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import CookieConsent from "@/components/CookieConsent";
import CustomerServiceButton from "@/components/CustomerServiceButton";
// import OfflineStatus from "@/components/OfflineStatus";
import "@/lib/consoleUtils"; // Initialize console utilities"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpulFlow - We whisper your product in the right ears",
  description: "Human-powered social media marketing with authentic engagement. Professional comment writing, influencer research, product reviews, and AI content humanization for real results.",
  keywords: "social media marketing, authentic comments, influencer outreach, product reviews, AI humanization, organic growth, social engagement",
  authors: [{ name: "OpulFlow Team" }],
  creator: "OpulFlow",
  publisher: "OpulFlow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://opulflow.top'),
  alternates: {
    canonical: '/',
  },
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
    title: "OpulFlow - We whisper your product in the right ears",
    description: "Authentic social media marketing with real human engagement. Professional comment writing, influencer research, and product reviews.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "OpulFlow - Human-Powered Social Media Marketing",
      }
    ],
    url: "https://opulflow.top",
    siteName: "OpulFlow",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpulFlow - We whisper your product in the right ears",
    description: "Authentic social media marketing with real human engagement.",
    images: ["/og-image.svg"],
    creator: "@opulflow_inc",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        <CustomerServiceButton />
        {/* <OfflineStatus /> */}
      </body>
    </html>
  );
}