import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import PostHogProvider from "@/components/providers/PostHogProvider";
import PostHogPageView from "@/components/PostHogPageView";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaaS Starter",
  description: "A production-ready Next.js SaaS boilerplate",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <PostHogProvider>
          <Suspense>
            <PostHogPageView />
          </Suspense>
          {children}
          <Toaster />
        </PostHogProvider>
      </body>
    </html>
  );
}
