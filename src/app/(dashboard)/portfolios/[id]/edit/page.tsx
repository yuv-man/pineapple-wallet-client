import EditPortfolioClient from "@/components/pages/EditPortfolioClient";

export async function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export default function EditPortfolioPage() {
  return <EditPortfolioClient />;
}
