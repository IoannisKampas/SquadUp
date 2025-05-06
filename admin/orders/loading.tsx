export default function OrdersLoading() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 w-48 bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-700 rounded animate-pulse"></div>
      </div>

      <div className="mb-6">
        <div className="h-10 w-96 bg-gray-700 rounded animate-pulse"></div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <div className="p-6 border-b border-gray-700">
          <div className="h-6 w-48 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-6 w-1/6 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-1/6 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-1/6 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-1/6 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-1/6 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-1/6 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
