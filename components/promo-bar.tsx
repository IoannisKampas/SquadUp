import CountdownTimer from "./countdown-timer"

export default function PromoBar() {
  return (
    <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 py-2">
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold uppercase">
            <span className="text-[#c1ff00]">Spring</span> Sale
            <span className="ml-1 inline-block animate-bounce">🎮</span>
          </div>
        </div>
        <CountdownTimer />
      </div>
    </div>
  )
}
