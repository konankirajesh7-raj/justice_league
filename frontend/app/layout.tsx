import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "OpportUnity — Never Miss an Opportunity Buried in WhatsApp",
  description:
    "Paste any WhatsApp forward → AI extracts company, role, eligibility, deadline, link → saved as clean searchable card → deadline reminders automatically. Built for 93M Indian college students.",
  keywords: [
    "opportunity tracker",
    "internship finder",
    "whatsapp opportunity",
    "college students",
    "hackathon",
    "scholarship",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OpportUnity",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#6366F1",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07080F] text-slate-200 antialiased">
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
