import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/app-layout";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "DataFlow BI - Business Intelligence Platform",
  description: "Transform data into actionable insights with DataFlow BI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
          backgroundColor: '#f5f6f7',
          color: '#1f2937',
          minHeight: '100vh',
        }}
      >
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
