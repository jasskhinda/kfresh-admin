import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KFresh Admin Panel - Manage Your Store",
  description: "Professional admin dashboard for KFresh Supermarket. Manage products, orders, and track payments.",
  keywords: "admin, dashboard, ecommerce, management, kfresh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
