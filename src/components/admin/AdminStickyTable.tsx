/**
 * Admin Sticky Table Component
 * 
 * Table wrapper with sticky header and horizontal scrolling.
 * Scrollbar is always visible at the bottom of the viewport.
 * Perfect for admin data tables with many columns.
 */

"use client";

import React from "react";

interface AdminStickyTableProps {
  children: React.ReactNode;
  className?: string;
}

export default function AdminStickyTable({ 
  children, 
  className = "" 
}: AdminStickyTableProps) {
  return (
    <div className={`w-full bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Scrollable container */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {children}
        </div>
      </div>
      
      {/* Custom scrollbar styles - Always visible */}
      <style jsx>{`
        div::-webkit-scrollbar {
          height: 10px;
          display: block;
        }
        
        div::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 0 0 12px 12px;
        }
        
        div::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #9ca3af, #6b7280);
          border-radius: 5px;
          border: 2px solid #f3f4f6;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #6b7280, #4b5563);
        }
        
        div::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, #4b5563, #374151);
        }
        
        /* Force scrollbar to always be visible */
        div {
          scrollbar-gutter: stable;
        }
      `}</style>
    </div>
  );
}
