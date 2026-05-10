import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nozomio",
  description: "A Tinder-style hackathon team picker that narrows the field to one winner."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
