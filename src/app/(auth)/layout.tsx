export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // pt-safe / pb-safe push content away from the iOS notch / Android status bar
  // and the home indicator, so the auth forms are never hidden behind system UI.
  return <div className="pt-safe pb-safe">{children}</div>;
}
