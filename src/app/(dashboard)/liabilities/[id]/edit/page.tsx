import EditLiabilityClient from "@/components/pages/EditLiabilityClient";

export async function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

interface Props {
  params: { id: string };
}

export default function EditLiabilityPage({ params }: Props) {
  return <EditLiabilityClient id={params.id} />;
}
