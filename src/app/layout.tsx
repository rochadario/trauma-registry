import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RESPOND Guatemala - Trauma Registry",
  description: "Trauma registry for Hospital Roosevelt and partner institutions in Guatemala",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
