// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/shell/Sidebar";
import Header from "@/components/shell/Header";

export const metadata: Metadata = {
  title: "GrowAI — Inventory Intelligence",
  description: "Modern AI-assisted inventory and sales dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#0b0d10] text-[#e5e7eb] antialiased">
        <div className="flex">
          {/* Shell: render ONCE here */}
          <Sidebar />

          <div
            className="
              relative flex-1 min-h-[100dvh]
              bg-[radial-gradient(1200px_500px_at_20%_-10%,rgba(99,102,241,.12),transparent),
                  radial-gradient(900px_400px_at_100%_110%,rgba(56,189,248,.12),transparent)]
            "
          >
            <Header />
            <main className="mx-auto max-w-[1400px] px-6 py-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
