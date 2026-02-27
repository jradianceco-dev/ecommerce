/**
 * =============================================================================
 * Landing Page - REDESIGNED (Image & Video Focused)
 * =============================================================================
 *
 * Clean, bright landing page showcasing visual content:
 * - Hero section with lifestyle imagery
 * - Featured categories with images
 * - Trending products
 * - Best sellers
 * - Brand values with visual emphasis
 * - Newsletter signup
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
    { 
      name: "Skincare", 
      icon: "✨", 
      image: "/beauty-face-model.jpg",
      gradient: "from-pink-400/80 to-rose-400/80"
    },
    { 
      name: "Makeup", 
      icon: "💄", 
      image: "/beauty-model.jpg",
      gradient: "from-purple-400/80 to-pink-400/80"
    },
    { 
      name: "Hair Care", 
      icon: "💇", 
      image: "/WhatsApp-Image-1.jpeg",
      gradient: "from-blue-400/80 to-cyan-400/80"
    },
    { 
      name: "Fragrance", 
      icon: "🌸", 
      image: "/WhatsApp-Image-2.jpeg",
      gradient: "from-amber-400/80 to-orange-400/80"
    },
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
    <div className="min-h-screen bg-radiance-creamBackgroundColor">
      {/* Hero Section - Clean, Image Focused */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/Untitled design_20260119_105156_0000.png"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          {/* Soft overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-20 w-full">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full text-radiance-goldColor text-sm font-semibold mb-6 shadow-sm">
              <Award size={16} />
              <span>Premium Beauty & Skincare</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-radiance-charcoalTextColor mb-6 leading-tight">
              Discover Your
              <span className="block text-radiance-goldColor">
                Natural Radiance
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
              Premium cosmetics and skincare products for the modern you.
              Authentic, affordable, and absolutely beautiful.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/shop"
                className="group bg-radiance-goldColor text-white px-6 py-3 rounded-full font-semibold text-base hover:bg-radiance-charcoalTextColor transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <ShoppingBag size={12} />
                Shop Now
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about-us"
                className="bg-white/80 backdrop-blur-sm text-radiance-charcoalTextColor px-6 py-3 rounded-full font-semibold text-base hover:bg-white transition-all border-2 border-radiance-goldColor/30 flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 py-20 mt-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 md:p-5 text-center border border-white/50 shadow-sm">
                <div className="text-3xl md:text-4xl font-black text-radiance-goldColor mb-1">10K+</div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">Happy Customers</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 md:p-5 text-center border border-white/50 shadow-sm">
                <div className="text-3xl md:text-4xl font-black text-radiance-goldColor mb-1">500+</div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">Products</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 md:p-5 text-center border border-white/50 shadow-sm">
                <div className="text-3xl md:text-4xl font-black text-radiance-goldColor mb-1">99%</div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group p-6 rounded-2xl hover:bg-radiance-creamBackgroundColor transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-radiance-goldColor to-yellow-400 rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section - Image Cards */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-radiance-charcoalTextColor mb-3">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600">Find exactly what you need</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/shop?category=${category.name.toLowerCase().replace(' ', '-')}`}
                className="group relative overflow-hidden rounded-3xl aspect-[3/4] md:aspect-square"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient}`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                  <div className="text-5xl mb-3">{category.icon}</div>
                  <h3 className="text-xl md:text-2xl font-bold">{category.name}</h3>
                  <div className="mt-3 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all">
                    <ArrowRight size={24} />
                  </div>
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
              <h2 className="text-4xl md:text-5xl font-black text-radiance-charcoalTextColor mb-2">
                Trending Now 🔥
              </h2>
              <p className="text-lg text-gray-600">What everyone's loving right now</p>
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

      {/* Best Sellers - Full Width Image Banner */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Banner with image background */}
          <div className="relative rounded-3xl overflow-hidden mb-12 h-64 md:h-80">
            <Image
              src="/beauty-model-removebg.png"
              alt="Best sellers banner"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-radiance-goldColor/90 to-transparent" />
            <div className="absolute inset-0 flex items-center p-8 md:p-12">
              <div className="text-white max-w-md">
                <h2 className="text-3xl md:text-4xl font-black mb-3">
                  Best Sellers ⭐
                </h2>
                <p className="text-lg text-white/90 mb-6">
                  Our most loved products that customers can't get enough of
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-white text-radiance-goldColor px-6 py-3 rounded-full font-bold hover:bg-radiance-charcoalTextColor hover:text-white transition-all"
                >
                  Shop Best Sellers
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showQuickAdd={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Values - Clean Light Design */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-radiance-creamBackgroundColor">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-radiance-charcoalTextColor mb-4">
              Why Choose JRADIANCE?
            </h2>
            <p className="text-xl text-gray-600">We're committed to excellence</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-radiance-goldColor/10 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle size={36} className="text-radiance-goldColor" />
              </div>
              <h3 className="text-2xl font-bold text-radiance-charcoalTextColor mb-4">100% Authentic</h3>
              <p className="text-gray-600 leading-relaxed">
                We source directly from manufacturers and authorized distributors.
                Every product is verified for authenticity and quality.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-radiance-goldColor/10 rounded-2xl flex items-center justify-center mb-6">
                <Users size={36} className="text-radiance-goldColor" />
              </div>
              <h3 className="text-2xl font-bold text-radiance-charcoalTextColor mb-4">Customer First</h3>
              <p className="text-gray-600 leading-relaxed">
                Your satisfaction is our priority. We offer personalized support,
                easy returns, and a loyalty program that rewards you.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-radiance-goldColor/10 rounded-2xl flex items-center justify-center mb-6">
                <Star size={36} className="text-radiance-goldColor" />
              </div>
              <h3 className="text-2xl font-bold text-radiance-charcoalTextColor mb-4">Premium Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                We curate only the finest products that meet our strict standards.
                Quality is not just a promise, it's our guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter - Soft Gradient */}
      <section className="py-20 px-4 bg-gradient-to-r from-radiance-goldColor/20 to-yellow-400/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl md:text-4xl font-black text-radiance-charcoalTextColor mb-4">
              Get 10% Off Your First Order
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Subscribe to our newsletter and receive exclusive offers, beauty tips, and early access to new arrivals.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-radiance-goldColor/20 border border-gray-200"
              />
              <button
                type="submit"
                className="bg-radiance-goldColor text-white px-8 py-4 rounded-full font-bold hover:bg-radiance-charcoalTextColor transition-all shadow-md"
              >
                Subscribe
              </button>
            </form>
            <p className="text-sm text-gray-500 mt-4">
              By subscribing, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-radiance-charcoalTextColor mb-6">
            Ready to Glow?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of happy customers who trust JRADIANCE for their beauty needs.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 bg-radiance-goldColor text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-radiance-charcoalTextColor transition-all shadow-xl hover:shadow-2xl"
          >
            <ShoppingBag size={24} />
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
