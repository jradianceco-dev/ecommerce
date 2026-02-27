/**
 * Admin Table Wrapper Component
 * 
 * Provides horizontal scrolling for tables with visual feedback.
 * Use this wrapper around any admin table to enable proper scrolling.
 */

"use client";

import React from "react";

interface AdminTableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function AdminTableWrapper({ 
  children, 
  className = "" 
}: AdminTableWrapperProps) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      {/* Scroll indicator gradient on left */}
      <div className="pointer-events-none sticky top-0 left-0 w-8 h-full absolute z-10 bg-gradient-to-r from-white to-transparent opacity-0 scrollbar-active:opacity-100 transition-opacity" />
      
      {/* Table container */}
      <div className="min-w-max">
        {children}
      </div>
      
      {/* Scroll indicator gradient on right */}
      <div className="pointer-events-none sticky top-0 right-0 w-8 h-full absolute z-10 bg-gradient-to-l from-white to-transparent opacity-0 scrollbar-active:opacity-100 transition-opacity" />
      
      {/* Custom scrollbar styles */}
      <style jsx>{`
        div::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        
        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        
        div::-webkit-scrollbar-thumb:active {
          background: #818181;
        }
      `}</style>
    </div>
  );
}
