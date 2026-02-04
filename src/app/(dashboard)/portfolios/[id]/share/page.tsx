import { SharePortfolioClient } from './SharePortfolioClient';

export async function generateStaticParams() {
  return [{ id: 'sample-id' }];
}

export default function SharePortfolioPage() {
  return <SharePortfolioClient />;
}
