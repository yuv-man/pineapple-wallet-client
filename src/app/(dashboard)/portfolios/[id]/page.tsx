import { PortfolioDetailClient } from './PortfolioDetailClient';

export async function generateStaticParams() {
  return [{ id: 'sample-id' }];
}

export default function PortfolioDetailPage() {
  return <PortfolioDetailClient />;
}
