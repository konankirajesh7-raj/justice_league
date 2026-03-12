import type { Metadata } from "next";
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
