import NewAssetClient from "@/components/pages/NewAssetClient";

// Required for static export - allows client-side routing for dynamic IDs
export function generateStaticParams() {
  return [];
}

export default function NewAssetPage() {
  return <NewAssetClient />;
}
