export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading admin dashboard...</p>
      </div>
    </div>
  )
}
