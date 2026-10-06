import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Layout from "@/components/commom/layout";
import TrekChatbot from "@/components/TrekChatbot";

export const metadata: Metadata = {
  title: "Trek Nepal",
  description: "Book treks, tours and gear in Nepal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Layout>{children}</Layout>
          <TrekChatbot />
        </Providers>
      </body>
    </html>
  );
}