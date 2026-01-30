"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserRoundPen } from "lucide-react";
import ProfileSettingsOverlay from "./ProfileSettingsOverlay";

// Navigation component for the top of all pages
export default function TopBar() {
  // State to manage the profile overlay visibility
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Placeholder for user state (data synced from Supabase)
  const [user] = useState<{
    name: string;
    email: string;
    phone: string;
    address: string;
    image: string;
  } | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-2 flex items-center justify-between">
        {/* Logo container */}
        <Link
          href="/"
        //   className="relative overflow-hidden h-12 w-36 md:h-14 md:w-44 flex items-center group transition-transform hover:scale-105"
          className="relative h-10 w-32 md:h-14 md:w-44 max-w-[40vw] flex items-center group transition-transform hover:scale-105"
        >
          <Image
            src="/logo-removebg.png"
            alt="JRADIANCE logo"
            fill
            priority
            className="object-contain object-left"
          />
          {/* Subtle gold line indicator on hover */}
          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-radiance-goldColor transition-all duration-300 group-hover:w-1/2" />
        </Link>

        {/* Profile and Settings interaction area (Always opens overlay now) */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex flex-col items-center gap-0.5 group"
          >
            {user ? (
              /* Displayed when User is Signed In */
              <div className="relative h-9 w-9 rounded-full bg-radiance-goldColor border-2 border-white shadow-sm overflow-hidden">
                <Image
                  src={user.image}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              /* Displayed when User is NOT Signed In */
              <div className="h-9 w-9 rounded-full bg-radiance-goldColor/10 flex items-center justify-center text-radiance-goldColor group-hover:bg-radiance-goldColor group-hover:text-white transition-all">
                <UserRoundPen size={18} />
              </div>
            )}

            <span className="text-[9px] font-bold text-radiance-charcoalTextColor group-hover:text-radiance-goldColor transition-colors">
              {user ? user.name.split(" ")[0] : "Account"}
            </span>
          </button>
        </div>
      </div>

      {/* Profile & Settings Overlay Component */}
      <ProfileSettingsOverlay
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
      />
    </header>
  );
}
