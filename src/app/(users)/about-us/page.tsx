/**
 * About Us Page
 * 
 * JRADIANCE company story, mission, vision, and values.
 */

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, 
  Heart, 
  Award, 
  Users, 
  CheckCircle, 
  Truck, 
  Shield, 
  MessageSquare 
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | JRADIANCE Cosmetics & Beauty",
  description: 
    "Learn about JRADIANCE's mission to provide premium beauty products. " +
    "Discover our story, values, and commitment to quality and customer satisfaction.",
  keywords: [
    "about JRADIANCE",
    "beauty company Nigeria",
    "cosmetics brand",
    "premium beauty products",
    "skincare Nigeria",
  ],
  openGraph: {
    title: "About JRADIANCE | Beauty Meets Excellence",
    description: "Your trusted partner in premium cosmetics and beauty solutions",
    type: "website",
  },
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-radiance-creamBackgroundColor">
      {/* Hero Section */}
      <section className="relative h-[70vh] bg-gradient-to-br from-radiance-charcoalTextColor to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-[url('/images/about-hero-pattern.svg')] opacity-10" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl text-white">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-radiance-goldColor" size={32} />
              <span className="text-sm font-medium tracking-wider uppercase">
                Welcome to JRADIANCE
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Beauty Meets{" "}
              <span className="text-radiance-goldColor">Excellence</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
              Your trusted partner in premium cosmetics and beauty solutions.
              We empower individuals to look and feel their best.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/shop"
                className="bg-radiance-goldColor text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-radiance-charcoalTextColor transition-all shadow-lg hover:shadow-xl"
              >
                Shop Now
              </Link>
              <Link
                href="/about-us#contact"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all border border-white/30"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-radiance-goldColor/10 rounded-2xl flex items-center justify-center mb-6">
              <Heart className="text-radiance-goldColor" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-radiance-charcoalTextColor mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              To empower individuals with high-quality, affordable beauty 
              products that enhance natural beauty and boost confidence. 
              We believe everyone deserves to feel beautiful, and we're 
              committed to providing the products that make that possible.
            </p>
          </div>
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-radiance-goldColor/10 rounded-2xl flex items-center justify-center mb-6">
              <Award className="text-radiance-goldColor" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-radiance-charcoalTextColor mb-4">
              Our Vision
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              To become Nigeria's leading beauty retailer, known for 
              exceptional products and outstanding customer service. 
              We envision a world where beauty is accessible, inclusive, 
              and celebrates diversity in all its forms.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-radiance-goldColor to-radiance-goldColor/80 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black mb-2">10K+</div>
              <div className="text-sm md:text-base opacity-90">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black mb-2">500+</div>
              <div className="text-sm md:text-base opacity-90">Premium Products</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black mb-2">99%</div>
              <div className="text-sm md:text-base opacity-90">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black mb-2">24/7</div>
              <div className="text-sm md:text-base opacity-90">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-radiance-charcoalTextColor mb-4">
            Our Core Values
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            These principles guide everything we do, from product selection to customer service.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <CheckCircle size={32} />,
              title: "Quality First",
              description: "We carefully curate only the finest products that meet our strict standards.",
            },
            {
              icon: <Users size={32} />,
              title: "Customer-Centric",
              description: "Your satisfaction is our priority. We listen, adapt, and deliver excellence.",
            },
            {
              icon: <Shield size={32} />,
              title: "Authenticity",
              description: "100% genuine products. We partner directly with trusted brands.",
            },
            {
              icon: <Truck size={32} />,
              title: "Fast Delivery",
              description: "Quick and reliable shipping across Nigeria. Beauty at your doorstep.",
            },
          ].map((value, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="w-16 h-16 bg-radiance-goldColor/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-radiance-goldColor group-hover:text-white transition-colors text-radiance-goldColor">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-radiance-charcoalTextColor mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-radiance-goldColor/10 text-radiance-goldColor px-4 py-2 rounded-full text-sm font-bold mb-4">
                Our Story
              </div>
              <h2 className="text-4xl font-bold text-radiance-charcoalTextColor mb-6">
                From Passion to Purpose
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  JRADIANCE was born from a simple yet powerful idea: everyone deserves 
                  access to premium beauty products that make them feel confident and beautiful.
                </p>
                <p>
                  What started as a small venture has grown into one of Nigeria's most 
                  trusted beauty retailers, serving thousands of satisfied customers 
                  across the country.
                </p>
                <p>
                  We partner directly with renowned brands worldwide to bring you 
                  authentic, high-quality products at competitive prices. Our 
                  commitment to excellence and customer satisfaction has made us 
                  a household name in the beauty industry.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-block mt-8 bg-radiance-goldColor text-white px-8 py-4 rounded-full font-bold hover:bg-radiance-charcoalTextColor transition-colors"
              >
                Explore Our Products
              </Link>
            </div>
            <div className="relative h-[500px] bg-gradient-to-br from-radiance-goldColor/20 to-radiance-goldColor/5 rounded-3xl overflow-hidden">
              {/* Placeholder for actual image */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center p-8">
                  <Sparkles className="mx-auto text-radiance-goldColor mb-4" size={64} />
                  <p className="text-gray-500 font-medium">
                    [JRadiance Brand Image Here]
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Replace with actual brand/team photo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-radiance-charcoalTextColor mb-4">
            Why Choose JRADIANCE?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We go above and beyond to ensure you have the best shopping experience.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <CheckCircle size={24} />,
              title: "Authentic Products",
              description: "100% genuine products sourced directly from brands",
            },
            {
              icon: <MessageSquare size={24} />,
              title: "Expert Support",
              description: "Our beauty experts are here to help you choose",
            },
            {
              icon: <Truck size={24} />,
              title: "Nationwide Delivery",
              description: "Fast shipping to all 36 states in Nigeria",
            },
            {
              icon: <Shield size={24} />,
              title: "Secure Payments",
              description: "Multiple payment options with complete security",
            },
            {
              icon: <Heart size={24} />,
              title: "Easy Returns",
              description: "Hassle-free return policy for your peace of mind",
            },
            {
              icon: <Award size={24} />,
              title: "Best Prices",
              description: "Competitive pricing with regular discounts",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-radiance-goldColor shrink-0">{feature.icon}</div>
              <div>
                <h3 className="font-bold text-radiance-charcoalTextColor mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-radiance-charcoalTextColor to-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to Discover Your Beauty?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust JRADIANCE for their beauty needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="bg-radiance-goldColor text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-radiance-charcoalTextColor transition-all shadow-lg hover:shadow-xl"
            >
              Start Shopping
            </Link>
            <Link
              href="/about-us#contact"
              className="bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-full font-bold hover:bg-white/20 transition-all border border-white/30"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-10 bg-gradient-to-br from-radiance-goldColor to-radiance-goldColor/80 text-white">
              <h3 className="text-3xl font-bold mb-6">Get in Touch</h3>
              <p className="mb-8 opacity-90">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
              <div className="space-y-4">
                <div>
                  <div className="font-bold mb-1">Email</div>
                  <div className="opacity-90">support@jradianceco.com</div>
                </div>
                <div>
                  <div className="font-bold mb-1">Phone</div>
                  <div className="opacity-90">+234 XXX XXX XXXX</div>
                </div>
                <div>
                  <div className="font-bold mb-1">Location</div>
                  <div className="opacity-90">Nigeria</div>
                </div>
              </div>
            </div>
            <div className="p-10">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent outline-none resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-radiance-goldColor text-white py-3 rounded-xl font-bold hover:bg-radiance-charcoalTextColor transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
