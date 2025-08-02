import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "../components/layout/Footer";
import { AuthProvider } from "../contexts/AuthContext";
import { TarotSessionProvider } from "../contexts/TarotSessionContext";
import "./globals.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
export const metadata: Metadata = {
  title: "Mystic Arcana",
  description: "AI-powered tarot and astrology platform",
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1a1a2e",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <TarotSessionProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </TarotSessionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
