import EditAssetClient from '@/components/pages/EditAssetClient';

// Required for static export - allows client-side routing for dynamic IDs
export function generateStaticParams() {
  return [];
}

export default function EditAssetPage() {
  return <EditAssetClient />;
}
