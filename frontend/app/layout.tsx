import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { Toaster } from "@/ui/toaster";
import { ThemeProvider } from "@/hooks/useTheme";
import { SidebarProvider } from "@/hooks/useSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ERP Frontend",
  description: "Modular ERP dashboard built with Next.js and shadcn/ui"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <ReactQueryProvider>
            <SidebarProvider>
              <div className="flex min-h-screen bg-background dark:bg-slate-950">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                  <Header />
                  <main className="px-8 py-6 space-y-6">{children}</main>
                </div>
              </div>
            </SidebarProvider>
          </ReactQueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
