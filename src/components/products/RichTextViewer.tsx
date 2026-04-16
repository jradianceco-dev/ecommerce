/**
 * =============================================================================
 * Rich Text Viewer for Product Details
 * =============================================================================
 *
 * Renders HTML content from the database with beautiful typography.
 * Supports: Headings, Tables, Colors, Lists, Bold, Italic.
 */

"use client";

interface RichTextViewerProps {
  content: string;
  className?: string;
}

export default function RichTextViewer({ content, className = "" }: RichTextViewerProps) {
  if (!content) return null;

  return (
    <div
      className={`
        prose prose-gray max-w-none
        prose-headings:font-bold prose-headings:text-radiance-charcoalTextColor
        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg
        prose-p:text-gray-600 prose-p:leading-relaxed
        prose-strong:text-radiance-charcoalTextColor
        prose-table:border-collapse prose-table:w-full prose-table:my-4
        prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-3 prose-th:text-left prose-th:font-semibold
        prose-td:border prose-td:border-gray-300 prose-td:p-3 prose-td:text-gray-600
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
