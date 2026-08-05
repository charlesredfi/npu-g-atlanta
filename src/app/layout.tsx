import type { Metadata } from "next";
import { DM_Sans, Oswald, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const display = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const ui = DM_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://npu-g-atlanta.vercel.app"),
  title: "NPU-G; 13 Neighborhoods, One Community",
  description:
    "Neighborhood Planning Unit G: About Us, News, 13 Neighborhoods, Events, Merch, and Contact for northwest Atlanta.",
  openGraph: {
    title: "NPU-G; 13 Neighborhoods, One Community",
    description:
      "Neighborhood Planning Unit G: About Us, News, 13 Neighborhoods, Events, Merch, and Contact for northwest Atlanta.",
    type: "website",
    siteName: "NPU-G Atlanta",
  },
  twitter: {
    card: "summary_large_image",
    title: "NPU-G; 13 Neighborhoods, One Community",
    description:
      "Neighborhood Planning Unit G: About Us, News, 13 Neighborhoods, Events, Merch, and Contact for northwest Atlanta.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${serif.variable} ${ui.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
