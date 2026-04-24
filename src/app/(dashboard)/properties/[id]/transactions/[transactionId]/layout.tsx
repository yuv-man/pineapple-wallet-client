// Provides generateStaticParams for the [transactionId] dynamic segment
// so the static export build succeeds for the inline 'use client' edit page.
export async function generateStaticParams() {
  return [{ transactionId: "__placeholder__" }];
}

export default function TransactionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
