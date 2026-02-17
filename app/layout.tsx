import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "../lib/utils";
import { ThemeProvider } from "../components/theme-provider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "World Time Capitals",
  description: "L'heure en temps réel dans les capitales du monde",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          src="https://hcs-widget-mvp.vercel.app/widget/v3/hcs-widget.js"
          data-widget="wid_39b91024584328cd3fd5b9a8"
          async
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased selection:bg-primary/20",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
