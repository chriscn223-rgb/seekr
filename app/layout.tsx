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
    default: "seekr · Find creators instantly",
    template: "%s · seekr",
  },
  description: "The creator intelligence layer. Search 23,000+ creators across platforms, niches, and locations. No ads. No logins. Just profiles.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "seekr · Find creators instantly",
    description: "Search the exact creator you need. Instantly.",
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
      <head>
        {/* Display font: Cabinet Grotesk for headings and brand */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@700,800,900&display=swap"
          rel="stylesheet"
        />
        {/* Body font: Satoshi for all UI text */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#080B14] text-[#EDF0F8]">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
