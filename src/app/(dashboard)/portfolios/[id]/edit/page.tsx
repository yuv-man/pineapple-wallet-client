import EditPortfolioClient from "@/components/pages/EditPortfolioClient";

// Required for static export - allows client-side routing for dynamic IDs
export function generateStaticParams() {
  return [];
}

export default function EditPortfolioPage() {
  return <EditPortfolioClient />;
}
