import SharePropertyClient from "@/components/pages/SharePropertyClient";

export async function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export default function SharePropertyPage() {
  return <SharePropertyClient />;
}
