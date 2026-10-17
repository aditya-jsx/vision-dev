import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Providers } from "./components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vision - Transform Ideas into Code",
  description: "Describe what you want to build, and watch AI generate complete, production-ready code in seconds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-x-hidden`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
