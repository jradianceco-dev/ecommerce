/**
 * About Us Page
 *
 * JRADIANCE company story, mission, vision, and values.
 * Enhanced with better animations, visual hierarchy, and brand presentation.
 */

import { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Heart,
  Award,
  Users,
  CheckCircle,
  Truck,
  Shield,
  MessageSquare,
  Star,
  Zap,
  Globe,
  ArrowRight,
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
      {/* Hero Section with Enhanced Visuals */}
      <section className="relative h-[80vh] bg-gradient-to-br from-radiance-charcoalTextColor via-gray-900 to-radiance-charcoalTextColor overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.1),transparent_50%)] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(212,175,55,0.08),transparent_50%)] animate-pulse delay-1000" />
        
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-radiance-goldColor/30 rounded-full animate-bounce" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-radiance-goldColor/20 rounded-full animate-bounce delay-500" />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-radiance-goldColor/25 rounded-full animate-bounce delay-1000" />

        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-radiance-goldColor text-sm font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles size={18} />
              <span className="tracking-wider uppercase">Welcome to JRADIANCE</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Beauty Meets{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-radiance-goldColor to-yellow-300">
                Excellence
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-2xl mb-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
              Your trusted partner in premium cosmetics and beauty solutions.
              We empower individuals to look and feel their best with authentic,
              high-quality products.
            </p>
            
            <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
              <Link
                href="/shop"
                className="group bg-radiance-goldColor text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-radiance-charcoalTextColor transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Shop Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#contact"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all border border-white/30"
              >
                Contact Us
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10 animate-in fade-in duration-1000 delay-500">
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle size={20} className="text-radiance-goldColor" />
                <span className="text-sm font-medium">100% Authentic</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Star size={20} className="text-radiance-goldColor" />
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Truck size={20} className="text-radiance-goldColor" />
                <span className="text-sm font-medium">Nationwide Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="group bg-white p-8 md:p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-radiance-goldColor to-yellow-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <Heart className="text-white" size={32} />
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
          <div className="group bg-white p-8 md:p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-radiance-goldColor to-yellow-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <Award className="text-white" size={32} />
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

      {/* Stats Section with Enhanced Design */}
      <section className="py-24 bg-gradient-to-r from-radiance-goldColor via-yellow-400 to-radiance-goldColor text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: "10K+", label: "Happy Customers", icon: Users },
              { value: "500+", label: "Premium Products", icon: Sparkles },
              { value: "99%", label: "Satisfaction Rate", icon: Heart },
              { value: "24/7", label: "Customer Support", icon: MessageSquare },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center group animate-in fade-in zoom-in duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl md:text-6xl lg:text-7xl font-black mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base opacity-90 font-medium flex items-center justify-center gap-2">
                  <stat.icon size={16} />
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block bg-radiance-goldColor/10 text-radiance-goldColor px-4 py-2 rounded-full text-sm font-bold mb-4">
            What Drives Us
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-radiance-charcoalTextColor mb-4">
            Our Core Values
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            These principles guide everything we do, from product selection to customer service.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <CheckCircle size={32} />,
              title: "Quality First",
              description: "We carefully curate only the finest products that meet our strict standards.",
              color: "from-green-500 to-emerald-600",
            },
            {
              icon: <Users size={32} />,
              title: "Customer-Centric",
              description: "Your satisfaction is our priority. We listen, adapt, and deliver excellence.",
              color: "from-blue-500 to-indigo-600",
            },
            {
              icon: <Shield size={32} />,
              title: "Authenticity",
              description: "100% genuine products. We partner directly with trusted brands.",
              color: "from-purple-500 to-pink-600",
            },
            {
              icon: <Zap size={32} />,
              title: "Fast Delivery",
              description: "Quick and reliable shipping across Nigeria. Beauty at your doorstep.",
              color: "from-yellow-500 to-orange-600",
            },
          ].map((value, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center"
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${value.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg text-white`}>
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
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-block bg-radiance-goldColor/10 text-radiance-goldColor px-4 py-2 rounded-full text-sm font-bold mb-6">
                Our Story
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-radiance-charcoalTextColor mb-8">
                From Passion to Purpose
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                <p className="border-l-4 border-radiance-goldColor pl-6">
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
                className="inline-flex items-center gap-2 mt-10 bg-radiance-goldColor text-white px-8 py-4 rounded-full font-bold hover:bg-radiance-charcoalTextColor transition-all shadow-lg hover:shadow-xl group"
              >
                Explore Our Products
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="relative h-[600px] bg-gradient-to-br from-radiance-goldColor/20 via-yellow-100 to-radiance-goldColor/10 rounded-3xl overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:scale-105 transition-transform duration-500">
                <div className="text-center p-12">
                  <div className="w-24 h-24 bg-radiance-goldColor/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Sparkles className="text-radiance-goldColor" size={48} />
                  </div>
                  <p className="text-gray-600 font-bold text-lg">
                    JRADIANCE Brand Image
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
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block bg-radiance-goldColor/10 text-radiance-goldColor px-4 py-2 rounded-full text-sm font-bold mb-4">
            The JRADIANCE Advantage
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-radiance-charcoalTextColor mb-4">
            Why Choose JRADIANCE?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
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
              icon: <Globe size={24} />,
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
              className="group flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-radiance-goldColor/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-radiance-goldColor shrink-0 p-3 bg-radiance-goldColor/10 rounded-xl group-hover:bg-radiance-goldColor group-hover:text-white transition-all">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bold text-radiance-charcoalTextColor mb-1 text-lg">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-radiance-charcoalTextColor via-gray-900 to-radiance-charcoalTextColor text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.1),transparent_70%)]" />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-6xl font-black mb-6 animate-in fade-in zoom-in duration-700">
            Ready to Discover Your Beauty?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Join thousands of satisfied customers who trust JRADIANCE for their beauty needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <Link
              href="/shop"
              className="group bg-radiance-goldColor text-white px-10 py-5 rounded-full font-bold hover:bg-white hover:text-radiance-charcoalTextColor transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Start Shopping
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#contact"
              className="bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-full font-bold hover:bg-white/20 transition-all border border-white/30"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 container mx-auto px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-12 bg-gradient-to-br from-radiance-goldColor via-yellow-400 to-radiance-goldColor text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <h3 className="text-3xl font-bold mb-6">Get in Touch</h3>
                <p className="mb-8 opacity-90 text-lg">
                  Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <div className="font-bold mb-1 text-sm uppercase tracking-wider">Email</div>
                      <div className="opacity-90">support@jradianceco.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Shield size={20} />
                    </div>
                    <div>
                      <div className="font-bold mb-1 text-sm uppercase tracking-wider">Phone</div>
                      <div className="opacity-90">+234 XXX XXX XXXX</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Globe size={20} />
                    </div>
                    <div>
                      <div className="font-bold mb-1 text-sm uppercase tracking-wider">Location</div>
                      <div className="opacity-90">Nigeria</div>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-10 pt-8 border-t border-white/20">
                  <p className="text-sm font-bold uppercase tracking-wider mb-4">Follow Us</p>
                  <div className="flex gap-3">
                    {['Instagram', 'Facebook', 'Twitter'].map((social) => (
                      <a
                        key={social}
                        href="#"
                        className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        aria-label={social}
                      >
                        <span className="sr-only">{social}</span>
                        <Globe size={18} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-12">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-radiance-goldColor outline-none transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-radiance-goldColor outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-radiance-goldColor focus:border-radiance-goldColor outline-none resize-none transition-all"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-radiance-goldColor to-yellow-400 text-white py-4 rounded-xl font-bold hover:from-radiance-goldColor hover:to-radiance-goldColor transition-all shadow-lg hover:shadow-xl"
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
