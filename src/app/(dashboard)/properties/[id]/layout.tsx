// Provides generateStaticParams for ALL routes under /properties/[id]/*
// so the static export build doesn't fail for 'use client' page files
// that cannot export generateStaticParams themselves.
export async function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
