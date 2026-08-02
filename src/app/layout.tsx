import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StreamDonate - Livestreaming Direct QRIS SeaBank (0% Fee)",
  description: "Platform donasi livestreaming direct QRIS SeaBank tanpa potongan pajak/fee dengan notifikasi iOS otomatis dan OBS Overlay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
