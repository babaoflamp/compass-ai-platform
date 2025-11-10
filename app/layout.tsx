import type { Metadata } from "next";
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
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
