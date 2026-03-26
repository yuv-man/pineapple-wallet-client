import NewAssetClient from "@/components/pages/NewAssetClient";

export async function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export default function NewAssetPage() {
  return <NewAssetClient />;
}
