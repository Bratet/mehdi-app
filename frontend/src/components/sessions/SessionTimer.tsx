"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { formatTime } from "@/lib/utils"

interface SessionTimerProps {
  startTime: string
  plannedMinutes: number
  extendedMinutes: number
  size?: "sm" | "lg"
}

const playBeep = () => {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    gain.gain.value = 0.3
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
  } catch {}
}

export default function SessionTimer({
  startTime,
  plannedMinutes,
  extendedMinutes,
  size = "sm",
}: SessionTimerProps) {
  const totalSeconds = (plannedMinutes + extendedMinutes) * 60

  const calcRemaining = useCallback(() => {
    const elapsed = (Date.now() - new Date(startTime).getTime()) / 1000
    return Math.max(0, totalSeconds - elapsed)
  }, [startTime, totalSeconds])

  const [remaining, setRemaining] = useState(calcRemaining)
  const beeped5min = useRef(false)
  const beeped0 = useRef(false)

  useEffect(() => {
    beeped5min.current = false
    beeped0.current = false
  }, [startTime, totalSeconds])

  useEffect(() => {
    const tick = () => {
      const r = calcRemaining()
      setRemaining(r)

      if (r <= 300 && r > 0 && !beeped5min.current) {
        beeped5min.current = true
        playBeep()
      }
      if (r <= 0 && !beeped0.current) {
        beeped0.current = true
        playBeep()
      }
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [calcRemaining])

  const progress = totalSeconds > 0 ? Math.min(1, Math.max(0, remaining / totalSeconds)) : 0
  const isLg = size === "lg"
  const svgSize = isLg ? 200 : 120
  const radius = isLg ? 80 : 50
  const strokeWidth = isLg ? 8 : 6
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  // Color based on remaining percentage
  let strokeColor = "#00FF88"
  if (progress <= 0.25) {
    strokeColor = "#FF4757"
  } else if (progress <= 0.5) {
    strokeColor = "#FFB800"
  }

  const isPulsing = remaining > 0 && remaining <= 300

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg
        width={svgSize}
        height={svgSize}
        className={isPulsing ? "animate-pulse" : ""}
      >
        {/* Background track */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${svgSize / 2} ${svgSize / 2})`}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
        />
        {/* Center text */}
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          className="font-mono font-bold"
          fontSize={isLg ? 28 : 18}
        >
          {formatTime(Math.max(0, Math.floor(remaining)))}
        </text>
        <text
          x="50%"
          y={isLg ? "62%" : "64%"}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-secondary)"
          fontSize={isLg ? 13 : 10}
        >
          remaining
        </text>
      </svg>
    </div>
  )
}
