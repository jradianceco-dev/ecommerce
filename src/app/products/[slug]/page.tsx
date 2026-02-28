import { redirect } from "next/navigation";

interface Props {
  params: {
    slug: string;
  };
}

export default function Page({ params }: Props) {
  const { slug } = params;
  // Redirect legacy /products/:slug URLs to /shop/products/:slug
  redirect(`/shop/products/${encodeURIComponent(slug)}`);
}
