import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : 'https://bewama.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Bewama | Your Partner in Industrial Materials",
  description: "Reliable supply chain solutions for Quality Chemicals & Timber. Delivering excellence across Kenya's manufacturing sectors.",
  openGraph: {
    siteName: 'Bewama',
    type: 'website',
    title: 'Bewama | Your Partner in Industrial Materials',
    description: "Reliable supply chain solutions for Quality Chemicals & Timber. Delivering excellence across Kenya's manufacturing sectors.",
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Bewama Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bewama | Your Partner in Industrial Materials',
    description: "Reliable supply chain solutions for Quality Chemicals & Timber. Delivering excellence across Kenya's manufacturing sectors.",
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}