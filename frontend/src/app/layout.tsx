import type { Metadata } from "next";
import Image from "next/image";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { PromoBanner } from "@/components/ui/promo-banner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cusygen",
  description: "Agent Service Marketplace - Buy and sell AI services with USDC via Locus Checkout",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = localStorage.getItem("theme-storage");
                  var parsed = theme ? JSON.parse(theme) : null;
                  var mode = parsed && parsed.state && parsed.state.theme ? parsed.state.theme : "light";
                  document.documentElement.setAttribute("data-theme", mode);
                } catch (e) {
                  document.documentElement.setAttribute("data-theme", "light");
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Image
          src="/bg-expert.webp"
          alt=""
          fill
          className="fixed inset-0 -z-20 object-cover"
          priority
        />
        <PromoBanner />
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
