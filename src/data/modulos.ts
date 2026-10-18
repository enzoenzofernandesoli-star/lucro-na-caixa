// Course modules, names taken from docs/CURRICULO.md.
export type Nivel = "iniciante" | "intermediario" | "avancado";

export type Modulo = {
  numero: number;
  slug: string;
  titulo: string;
  nivel: Nivel;
};

export const MODULOS: readonly Modulo[] = [
  { numero: 0, slug: "00-como-estudar-este-curso", titulo: "Como estudar este curso", nivel: "iniciante" },
  { numero: 1, slug: "01-a-conta-do-produto", titulo: "A conta do produto", nivel: "iniciante" },
  { numero: 2, slug: "02-fundamentos-do-e-commerce-no-brasil", titulo: "Fundamentos do e-commerce no Brasil", nivel: "iniciante" },
  { numero: 3, slug: "03-pesquisa-e-validacao-de-produto", titulo: "Pesquisa e validação de produto", nivel: "iniciante" },
  { numero: 4, slug: "04-fornecedores-e-compra", titulo: "Fornecedores e compra", nivel: "iniciante" },
  { numero: 5, slug: "05-fotos-titulo-e-descricao", titulo: "Fotos, título e descrição que vendem", nivel: "intermediario" },
  { numero: 6, slug: "06-shopee", titulo: "Shopee", nivel: "intermediario" },
  { numero: 7, slug: "07-mercado-livre", titulo: "Mercado Livre", nivel: "intermediario" },
  { numero: 8, slug: "08-tiktok-shop-e-social-commerce", titulo: "TikTok Shop e social commerce", nivel: "intermediario" },
  { numero: 9, slug: "09-loja-propria", titulo: "Loja própria", nivel: "intermediario" },
  { numero: 10, slug: "10-copy-e-oferta", titulo: "Copy e oferta", nivel: "intermediario" },
  { numero: 11, slug: "11-criativo-e-video-para-anuncio", titulo: "Criativo e vídeo para anúncio", nivel: "intermediario" },
  { numero: 12, slug: "12-trafego-pago-meta-ads", titulo: "Tráfego pago: Meta Ads", nivel: "intermediario" },
  { numero: 13, slug: "13-tiktok-ads-e-google", titulo: "TikTok Ads e Google", nivel: "avancado" },
  { numero: 14, slug: "14-metricas-analise-e-escala", titulo: "Métricas, análise e escala", nivel: "avancado" },
  { numero: 15, slug: "15-operacao", titulo: "Operação: expedição, atendimento e pós-venda", nivel: "intermediario" },
  { numero: 16, slug: "16-dropshipping-completo", titulo: "Dropshipping completo", nivel: "avancado" },
  { numero: 17, slug: "17-retencao-e-relacionamento", titulo: "Retenção e relacionamento", nivel: "avancado" },
  { numero: 18, slug: "18-hub-erp-e-automacao-com-ia", titulo: "Hub, ERP e automação com IA", nivel: "avancado" },
  { numero: 19, slug: "19-projeto-final", titulo: "Projeto final: lançar um produto do zero", nivel: "avancado" },
];

export const ROTULO_NIVEL: Record<Nivel, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export function moduloPorSlug(slug: string): Modulo | undefined {
  return MODULOS.find((m) => m.slug === slug);
}

export function doisDigitos(n: number): string {
  return String(n).padStart(2, "0");
}
