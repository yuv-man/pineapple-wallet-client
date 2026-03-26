import EditAssetClient from "@/components/pages/EditAssetClient";

// Static export: Next requires at least one param; real IDs still work client-side.
export async function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export default function EditAssetPage() {
  return <EditAssetClient />;
}
