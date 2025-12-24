import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TelegramWrapper } from "@/components/TelegramWrapper";
import Script from "next/script";
import { ToastProvider } from "@/components/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Minties - MoneyBox, Crypto Gifts & Savings Circles",
  description: "Target savings with high yield, send USDC gifts, and save with friends in savings circles—all in Telegram",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Telegram Web App SDK */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>
          <ToastProvider>
            <TelegramWrapper>{children}</TelegramWrapper>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}

