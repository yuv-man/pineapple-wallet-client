import PortfolioDetailClient from '@/components/pages/PortfolioDetailClient';

// Required for static export - allows client-side routing for dynamic IDs
export function generateStaticParams() {
  return [];
}

export default function PortfolioDetailPage() {
  return <PortfolioDetailClient />;
}
