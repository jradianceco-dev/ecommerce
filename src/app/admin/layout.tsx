/**
 * Admin Layout
 * 
 * Applies consistent padding and centering to all admin pages
 * ensuring the dashboard remains readable and centered.
 */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {children}
    </div>
  );
}
