export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-safe pb-safe relative">
      {/* Background blobs — same language as dashboard */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pineapple/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-amber-300/8 rounded-full blur-3xl" />
      </div>
      {children}
    </div>
  );
}
