import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "S Lounge – PlayStation & Games Café Management",
  description:
    "The ultimate management solution for PlayStation lounges, cyber cafés, billiard halls, and gaming centers. Powerful, offline-first, cross-platform.",
  keywords: [
    "PlayStation lounge",
    "gaming cafe",
    "cafe management",
    "billiard hall",
    "cyber cafe",
    "POS system",
    "Flutter app",
  ],
  openGraph: {
    title: "S Lounge – PlayStation & Games Café Management",
    description:
      "Manage your gaming lounge like a pro with real-time sessions, billing, analytics and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-dark-900 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
