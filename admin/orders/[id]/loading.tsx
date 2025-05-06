export default function OrderDetailLoading() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-10 w-10 bg-gray-700 rounded animate-pulse"></div>
        <div className="h-8 w-48 bg-gray-700 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <div className="h-6 w-48 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-20 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-20 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="h-10 bg-gray-700 rounded animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="h-16 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-16 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-16 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="h-10 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
