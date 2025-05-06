"use client"

import { useEffect, useState } from "react"

export default function CountdownTimer() {
  const [time, setTime] = useState({
    days: 0,
    hours: 8,
    minutes: 41,
    seconds: 58,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {
        let { days, hours, minutes, seconds } = prevTime

        seconds--

        if (seconds < 0) {
          seconds = 59
          minutes--

          if (minutes < 0) {
            minutes = 59
            hours--

            if (hours < 0) {
              hours = 23
              days--

              if (days < 0) {
                clearInterval(timer)
                return { days: 0, hours: 0, minutes: 0, seconds: 0 }
              }
            }
          }
        }

        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm font-medium uppercase text-purple-300">Remaining:</div>
      <div className="flex gap-1">
        <TimeUnit value={time.days} label="days" />
        <TimeUnit value={time.hours} label="hours" />
        <TimeUnit value={time.minutes} label="minutes" />
        <TimeUnit value={time.seconds} label="seconds" />
      </div>
    </div>
  )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-900 text-white">
        {value.toString().padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase text-purple-300">{label}</div>
    </div>
  )
}
