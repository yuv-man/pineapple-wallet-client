import { NewAssetClient } from './NewAssetClient';

export async function generateStaticParams() {
  return [{ id: 'sample-id' }];
}

export default function NewAssetPage() {
  return <NewAssetClient />;
}
