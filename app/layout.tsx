import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { siteConfig } from "@/services/site";
import "./globals.css";
import styles from "./layout.module.css";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-roboto-condensed",
});

const homeTitle = `${siteConfig.name} · Online-Wollgeschäft`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: homeTitle,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: siteConfig.name,
    title: homeTitle,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Hände stricken mit hellem Garn, daneben eine bordeauxrote Mütze und Wollknäuel.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: siteConfig.description,
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={robotoCondensed.variable} data-scroll-behavior="smooth">
      <body className={styles.body}>
        <Header />
        <main className={styles.main}>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
