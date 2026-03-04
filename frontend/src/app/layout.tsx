import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game Center",
  description: "Game Center Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
