import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BalletAdmin",
  description: "Sistema administrativo interno para academia de ballet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
