import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { RemindersProvider } from "@/components/RemindersProvider";
import { Header } from "@/components/Header";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Community Events Board",
  description: "Music nights, workshops, food fairs and more happening near you.",
};

export const viewport: Viewport = { themeColor: "#4f46e5" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className={`${jakarta.variable} font-sans`}>
        <AuthProvider>
          <RemindersProvider>
            <Header />
            <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">{children}</main>
          </RemindersProvider>
        </AuthProvider>
        <Toaster richColors position="top-center" closeButton />
      </body>
    </html>
  );
}
