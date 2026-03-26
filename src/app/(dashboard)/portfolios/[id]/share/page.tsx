import SharePortfolioClient from "@/components/pages/SharePortfolioClient";

// Required for static export - allows client-side routing for dynamic IDs
export function generateStaticParams() {
  return [];
}

export default function SharePortfolioPage() {
  return <SharePortfolioClient />;
}
