/**
 * Google Merchant Center Product Feed
 * URL: /api/product-feed
 *
 * Setup Guide:
 * 1. Go to https://merchants.google.com
 * 2. Products > Feeds > Add Primary Feed
 * 3. Choose "Scheduled fetch"
 * 4. URL: https://jradianceco.com/api/product-feed
 * 5. Refresh: Daily
 */

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from("products")
      .select(
        "id, name, slug, description, price, discount_price, images, is_active, stock_quantity, category",
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://jradianceco.com";

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
        <channel>
          <title>JRADIANCE Cosmetics</title>
          <link>${baseUrl}</link>
          <description>Premium Cosmetics &amp; Skincare for the Radiant Soul</description>
          ${products
            .filter((p: any) => p.is_active)
            .map((product: any) => {
              const images = Array.isArray(product.images)
                ? product.images
                : [];
              const imageUrl =
                images.length > 0 ? images[0] : `${baseUrl}/placeholder.jpg`;
              const finalPrice = product.discount_price || product.price;
              const productUrl = `${baseUrl}/shop/products/${product.slug}`;
              const availability =
                product.stock_quantity > 0 ? "in_stock" : "out_of_stock";

              return `
            <item>
              <g:id>${product.id}</g:id>
              <g:title><![CDATA[${product.name}]]></g:title>
              <g:description><![CDATA[${product.description || product.name}]]></g:description>
              <g:link>${productUrl}</g:link>
              <g:image_link>${imageUrl}</g:image_link>
              <g:brand>JRADIANCE</g:brand>
              <g:condition>new</g:condition>
              <g:availability>${availability}</g:availability>
              <g:price>${finalPrice.toFixed(2)} NGN</g:price>
              <g:product_type><![CDATA[${product.category}]]></g:product_type>
              <g:google_product_category>Health &amp; Beauty > Cosmetics</g:google_product_category>
            </item>`;
            })
            .join("")}
        </channel>
      </rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Product feed error:", error);
    return NextResponse.json(
      { error: "Failed to generate feed" },
      { status: 500 },
    );
  }
}
