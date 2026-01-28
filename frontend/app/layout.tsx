import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow - Modern Task Management Made Simple",
  description: "Stay organized, boost productivity, and achieve your goals with TaskFlow. Intuitive task management platform designed for modern teams and individuals.",
  keywords: ["task management", "productivity", "todo list", "project management", "team collaboration"],
  authors: [{ name: "TaskFlow Team" }],
  openGraph: {
    title: "TaskFlow - Modern Task Management Made Simple",
    description: "Stay organized and boost productivity with our intuitive task management platform.",
    type: "website",
    locale: "en_US",
    siteName: "TaskFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskFlow - Modern Task Management Made Simple",
    description: "Stay organized and boost productivity with our intuitive task management platform.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
