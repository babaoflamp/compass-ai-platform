import type { Metadata } from "next";
import { inter, notoSansKr } from "@/lib/fonts";
import { ToastProvider } from "@/components/providers/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "COMPASS - AI Learning Platform",
  description: "Competency Oriented Mentoring Platform with AI Support System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKr.variable}`}>
      <body className="antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
