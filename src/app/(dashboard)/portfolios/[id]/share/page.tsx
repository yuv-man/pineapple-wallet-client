import SharePortfolioClient from "@/components/pages/SharePortfolioClient";

export async function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export default function SharePortfolioPage() {
  return <SharePortfolioClient />;
}
