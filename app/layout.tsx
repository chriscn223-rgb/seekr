import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "seekr — Instant Creator Search",
    template: "%s | seekr",
  },
  description: "Search creators by name, username, niche, tags, location. Clean, fast, no logins, no ads. The most accurate creator discovery engine.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "seekr — Instant Creator Search",
    description: "Search creators instantly. Profiles only. No noise.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#05060A] text-[#F9FAFB]">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
