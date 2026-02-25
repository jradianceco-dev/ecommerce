import ProductFeeds from "@/components/products/ProductFeeds";
import { getProducts } from "@/utils/supabase/services-server";
import { ProductFilters } from "@/types";

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Next.js 15: searchParams must be awaited
  const params = await searchParams;
  
  const filters: ProductFilters = {
    category:
      typeof params.category === "string"
        ? params.category
        : undefined,
    search:
      typeof params.search === "string" ? params.search : undefined,
    limit: 12,
    is_active: true,
  };

  const initialProducts = await getProducts(filters);

  return (
    <div className="min-h-screen bg-radiance-creamBackgroundColor text-radiance-charcoalTextColor">
      <main className="mx-auto max-w-7xl px-4 md:px-8 py-12">
        <ProductFeeds
          initialProducts={initialProducts}
          initialFilters={filters}
          title="JRadiance Cosmetics & Beauty Shop"
          subtitle="Discover the perfect products for your beauty needs."
          skipInitialFetch={true}
        />
      </main>
    </div>
  );
}