import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "美味食堂 - 掃碼點餐",
  description: "快速掃碼點餐系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
