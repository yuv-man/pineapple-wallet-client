import { EditAssetClient } from './EditAssetClient';

export async function generateStaticParams() {
  return [{ id: 'sample-id' }];
}

export default function EditAssetPage() {
  return <EditAssetClient />;
}
