import { EditPortfolioClient } from './EditPortfolioClient';

export async function generateStaticParams() {
  return [{ id: 'sample-id' }];
}

export default function EditPortfolioPage() {
  return <EditPortfolioClient />;
}
