import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, IBM_Plex_Mono, Saira_Stencil } from "next/font/google";
import "./globals.css";

// The design uses "Saira Stencil One", which next/font no longer lists. Saira Stencil at 700
// is the same family and matches it visually.
const sairaStencil = Saira_Stencil({
  variable: "--font-saira-stencil",
  weight: "700",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lucro na Caixa — curso de e-commerce e dropshipping",
    template: "%s · Lucro na Caixa",
  },
  description:
    "E-commerce e dropshipping do zero ao avançado: vender mais, anunciar melhor e saber se cada venda deixa dinheiro no caixa.",
};

export const viewport: Viewport = {
  themeColor: "#D9BC8C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${sairaStencil.variable} ${bricolage.variable} ${figtree.variable} ${plexMono.variable} antialiased`}
    >
      <body className="min-h-dvh">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-[10px] focus:border-[3px] focus:border-tinta focus:bg-amarelo focus:px-4 focus:py-3 focus:font-bold"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
