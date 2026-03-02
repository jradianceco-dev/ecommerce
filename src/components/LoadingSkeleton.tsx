/**
 * Loading Skeleton Components
 * 
 * Provides visual feedback during loading states
 * Improves perceived performance
 */

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="w-full aspect-square bg-gray-200" />
      
      {/* Content placeholder */}
      <div className="p-3 space-y-2">
        {/* Category */}
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        
        {/* Title */}
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        
        {/* Rating */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-200 rounded" />
          ))}
        </div>
        
        {/* Price */}
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        
        {/* Button */}
        <div className="h-10 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24" />
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-16" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 bg-gray-200 rounded w-20" />
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 rounded-full w-24" />
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 rounded-full w-24" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20" />
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-20" />
        </div>
      </td>
    </tr>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      {/* Avatar placeholder */}
      <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6" />
      
      {/* Form fields placeholder */}
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded-lg" />
        <div className="h-12 bg-gray-200 rounded-lg" />
        <div className="h-12 bg-gray-200 rounded-lg" />
        <div className="h-12 bg-gray-200 rounded-lg" />
        <div className="h-12 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-24" />
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl animate-pulse">
      {/* Image placeholder */}
      <div className="w-20 h-20 bg-gray-200 rounded-lg" />
      
      {/* Content placeholder */}
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/4" />
      </div>
      
      {/* Quantity placeholder */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded" />
        <div className="w-8 h-8 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
          </td>
        </tr>
      ))}
    </>
  );
}
