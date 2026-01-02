import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ปลูกอะไรดี | Plook Arai Dee",
  description: "ระบบแนะนำพืชปลูกสำหรับเกษตรกรไทย - เชื่อมต่อเกษตรกรกับผู้รับซื้อโดยตรง",
  keywords: ["เกษตร", "ปลูกพืช", "ราคาตลาด", "เกษตรกร", "ผู้รับซื้อ"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="font-sans antialiased bg-slate-50" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

