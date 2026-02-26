/**
 * =============================================================================
 * Landing Page - REDESIGNED
 * =============================================================================
 * 
 * Modern, intuitive landing page with:
 * - Hero section with CTA
 * - Featured categories
 * - Trending products
 * - Best sellers
 * - Brand values
 * - Newsletter signup
 * - Social proof
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingBag, 
  Star, 
  Truck, 
  Shield, 
  Heart, 
  ArrowRight,
  Sparkles,
  Award,
  Users,
  CheckCircle
} from "lucide-react";
import { getProducts, getTrendingProducts, getBestSellerProducts } from "@/utils/supabase/services-server";
import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/types";

export default function LandingPage() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const [trending, bestSelling] = await Promise.all([
        getTrendingProducts(8),
        getBestSellerProducts(8),
      ]);
      setTrendingProducts(trending);
      setBestSellers(bestSelling);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const categories = [
    { name: "Skincare", icon: "✨", color: "from-pink-500 to-rose-500" },
    { name: "Makeup", icon: "💄", color: "from-purple-500 to-pink-500" },
    { name: "Hair Care", icon: "💇", color: "from-blue-500 to-cyan-500" },
    { name: "Fragrance", icon: "🌸", color: "from-amber-500 to-orange-500" },
  ];

  const features = [
    {
      icon: Truck,
      title: "Free Delivery",
      description: "On orders over ₦50,000",
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "100% secure transactions",
    },
    {
      icon: Heart,
      title: "Love Guarantee",
      description: "30-day return policy",
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "Authentic products only",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-radiance-creamBackgroundColor to-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-radiance-charcoalTextColor via-gray-900 to-black">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-radiance-goldColor/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-radiance-goldColor/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-radiance-goldColor text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={18} />
            <span>Premium Beauty & Skincare</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Discover Your
            <span className="block bg-gradient-to-r from-radiance-goldColor to-yellow-300 bg-clip-text text-transparent">
              Natural Radiance
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            Premium cosmetics and skincare products for the modern you. 
            Authentic, affordable, and absolutely beautiful.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <Link
              href="/shop"
              className="group bg-radiance-goldColor text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-radiance-charcoalTextColor transition-all shadow-2xl hover:shadow-radiance-goldColor/50 flex items-center justify-center gap-3"
            >
              <ShoppingBag size={24} />
              Shop Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about-us"
              className="bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white/20 transition-all border border-white/30 flex items-center justify-center"
            >
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/10">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-radiance-goldColor mb-2">10K+</div>
              <div className="text-sm text-gray-400">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-radiance-goldColor mb-2">500+</div>
              <div className="text-sm text-gray-400">Premium Products</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-radiance-goldColor mb-2">99%</div>
              <div className="text-sm text-gray-400">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group p-6 rounded-2xl hover:bg-radiance-creamBackgroundColor transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-radiance-goldColor to-yellow-400 rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600">Find exactly what you need</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/shop?category=${category.name.toLowerCase().replace(' ', '-')}`}
                className="group relative overflow-hidden rounded-3xl aspect-square"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="text-6xl mb-4">{category.icon}</div>
                  <h3 className="text-2xl font-bold">{category.name}</h3>
                  <ArrowRight size={24} className="mt-4 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                Trending Now 🔥
              </h2>
              <p className="text-xl text-gray-600">What everyone's loving right now</p>
            </div>
            <Link
              href="/shop"
              className="hidden md:flex items-center gap-2 text-radiance-goldColor font-bold hover:underline underline-offset-4"
            >
              View All
              <ArrowRight size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {trendingProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showQuickAdd={true}
                  />
                ))}
              </div>
              <div className="mt-12 text-center md:hidden">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-radiance-goldColor text-white px-8 py-4 rounded-full font-bold hover:bg-radiance-charcoalTextColor transition-colors"
                >
                  View All Products
                  <ArrowRight size={20} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                Best Sellers ⭐
              </h2>
              <p className="text-xl text-gray-600">Our most loved products</p>
            </div>
            <Link
              href="/shop"
              className="hidden md:flex items-center gap-2 text-radiance-goldColor font-bold hover:underline underline-offset-4"
            >
              View All
              <ArrowRight size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {bestSellers.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showQuickAdd={true}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-20 px-4 bg-gradient-to-br from-radiance-charcoalTextColor to-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Why Choose JRADIANCE?
            </h2>
            <p className="text-xl text-gray-300">We're committed to excellence</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
              <CheckCircle size={48} className="text-radiance-goldColor mb-6" />
              <h3 className="text-2xl font-bold mb-4">100% Authentic</h3>
              <p className="text-gray-300 leading-relaxed">
                We source directly from manufacturers and authorized distributors. 
                Every product is verified for authenticity and quality.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
              <Users size={48} className="text-radiance-goldColor mb-6" />
              <h3 className="text-2xl font-bold mb-4">Customer First</h3>
              <p className="text-gray-300 leading-relaxed">
                Your satisfaction is our priority. We offer personalized support, 
                easy returns, and a loyalty program that rewards you.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
              <Star size={48} className="text-radiance-goldColor mb-6" />
              <h3 className="text-2xl font-bold mb-4">Premium Quality</h3>
              <p className="text-gray-300 leading-relaxed">
                We curate only the finest products that meet our strict standards. 
                Quality is not just a promise, it's our guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-4 bg-gradient-to-r from-radiance-goldColor to-yellow-400">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Get 10% Off Your First Order
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Subscribe to our newsletter and receive exclusive offers, beauty tips, and early access to new arrivals.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <button
              type="submit"
              className="bg-radiance-charcoalTextColor text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-radiance-charcoalTextColor transition-all shadow-lg"
            >
              Subscribe
            </button>
          </form>
          <p className="text-sm text-white/70 mt-4">
            By subscribing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Ready to Glow?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of happy customers who trust JRADIANCE for their beauty needs.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 bg-radiance-charcoalTextColor text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-radiance-goldColor transition-all shadow-xl hover:shadow-2xl"
          >
            <ShoppingBag size={24} />
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
