import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nonstopbid.lol",
  description: "Pay to claim a rank. Lose it to a higher bid, drop down the board.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-black text-neutral-100">
        <Nav />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
