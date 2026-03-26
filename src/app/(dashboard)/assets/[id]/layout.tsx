export async function generateStaticParams() {
  return [{ id: 'sample-id' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
