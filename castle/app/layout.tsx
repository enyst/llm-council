import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Grand Library - Castle LLM Oracle",
  description: "A mystical library where ancient oracles answer your questions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
