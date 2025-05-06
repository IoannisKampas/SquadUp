import { Loader2 } from "lucide-react"

export default function SessionDetailLoading() {
  return (
    <div className="p-8 flex justify-center items-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-green-500" />
    </div>
  )
}
