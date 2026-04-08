/**
 * Standard User Layout
 *
 * Applies consistent padding and centering to all user-facing pages
 * (Shop, About Us, Checkout, etc.) while keeping the root layout clean.
 */

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mx-auto max-w-6xl px-6 py-12">{children}</div>;
}
