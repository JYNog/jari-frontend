// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "자리(JARI)",
  description: "부동산 입지분석 플랫폼",
  icons: {
    icon: "/favicon.ico",   // 또는 "/jari_logo.png"
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
