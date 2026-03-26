import PortfolioDetailClient from "@/components/pages/PortfolioDetailClient";

export async function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export default function PortfolioDetailPage() {
  return <PortfolioDetailClient />;
}
