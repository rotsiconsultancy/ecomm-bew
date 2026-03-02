import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bewama | Your Partner in Industrial Materials",
  description: "Reliable supply chain solutions for Quality Chemicals & Timber. Delivering excellence across Europe's manufacturing sectors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#f8fafc] text-[#1e293b]`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
