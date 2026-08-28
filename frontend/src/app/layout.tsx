import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "TelcomAI | Next-Gen Network Intelligence Platform",
  description: "Enterprise-grade AI platform for telecom network monitoring, anomaly detection, digital twins, and edge intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} antialiased bg-[#020617] text-slate-100 flex min-h-screen font-sans noise-overlay`}
      >
        {/* Ambient glow orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/[0.07] rounded-full blur-[120px]" />
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-violet-600/[0.05] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-cyan-600/[0.04] rounded-full blur-[100px]" />
        </div>
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
