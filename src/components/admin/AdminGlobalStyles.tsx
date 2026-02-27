/**
 * Admin Pages Global Styles
 * 
 * Ensures horizontal scrollbars are always visible on admin pages
 * regardless of page height/content length.
 */

export default function AdminGlobalStyles() {
  return (
    <style jsx global>{`
      /* Force horizontal scrollbar to always be visible on admin main content */
      main[class*="ml-"] {
        scrollbar-width: thin;
        scrollbar-color: #9ca3af #f3f4f6;
      }

      main[class*="ml-"]::-webkit-scrollbar {
        height: 12px;
        width: 12px;
        display: block !important;
      }

      main[class*="ml-"]::-webkit-scrollbar-track {
        background: #f3f4f6;
        border-radius: 8px;
      }

      main[class*="ml-"]::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #a1a1aa, #71717a);
        border-radius: 6px;
        border: 2px solid #f3f4f6;
        min-height: 20px;
      }

      main[class*="ml-"]::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #71717a, #52525b);
      }

      main[class*="ml-"]::-webkit-scrollbar-thumb:active {
        background: linear-gradient(180deg, #52525b, #3f3f46);
      }

      /* Ensure scrollbar is always visible even on short pages */
      main[class*="ml-"]::-webkit-scrollbar-button {
        display: none;
      }

      /* Table-specific scrollbar styling */
      .overflow-x-auto::-webkit-scrollbar {
        height: 10px;
        display: block !important;
      }

      .overflow-x-auto::-webkit-scrollbar-track {
        background: #f9fafb;
        border-radius: 0 0 8px 8px;
      }

      .overflow-x-auto::-webkit-scrollbar-thumb {
        background: linear-gradient(90deg, #d1d5db, #9ca3af);
        border-radius: 5px;
        border: 1px solid #f9fafb;
      }

      .overflow-x-auto::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(90deg, #9ca3af, #6b7280);
      }

      /* Force display of scrollbar */
      .overflow-x-auto {
        -ms-overflow-style: scrollbar !important;
        scrollbar-width: thin !important;
      }
    `}</style>
  );
}
