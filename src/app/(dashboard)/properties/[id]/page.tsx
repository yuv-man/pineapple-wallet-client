import PropertyDetailClient from "@/components/pages/PropertyDetailClient";

export async function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export default function PropertyDetailPage() {
  return <PropertyDetailClient />;
}
