"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface LocationItem {
  city: string
  timezone: string
  timeZoneId: string
  color: string
}

function useLiveTime(timeZoneId: string, timezone: string) {
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: timeZoneId,
        })
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [timeZoneId])

  return currentTime ? `${currentTime} ${timezone}` : ""
}

export function LocationTags({ locations }: { locations: LocationItem[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <span className="inline-flex items-center gap-1" style={{ marginLeft: "-8px" }}>
      {locations.map((loc, i) => (
        <FlipTag key={loc.city} loc={loc} isHovered={hoveredIndex === i} isAnyHovered={hoveredIndex !== null} hoveredIndex={hoveredIndex} index={i} onHover={() => setHoveredIndex(i)} onLeave={() => setHoveredIndex(null)} />
      ))}
    </span>
  )
}

function FlipTag({ loc, isHovered, onHover, onLeave }: { loc: LocationItem; isHovered: boolean; isAnyHovered: boolean; hoveredIndex: number | null; index: number; onHover: () => void; onLeave: () => void }) {
  const timeText = useLiveTime(loc.timeZoneId, loc.timezone)
  const h = 14

  return (
    <span
      className="relative cursor-default inline-flex items-center rounded-full px-2 py-0.5 font-normal"
      style={{ fontSize: "10px", color: isHovered ? loc.color : "#DADADA", perspective: "600px", transition: "color 0.25s ease" }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: "rgba(218, 218, 218, 0.15)", transition: "opacity 0.25s ease", opacity: isHovered ? 0 : 1 }}
      />
      {isHovered && (
        <motion.span
          layoutId="location-pill"
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: `${loc.color}1A` }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
      <motion.span
        className="relative z-10 inline-block"
        animate={{ rotateX: isHovered ? -90 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }}
        style={{
          transformStyle: "preserve-3d",
          lineHeight: `${h}px`,
        }}
      >
        <span
          style={{
            display: "block",
            transform: `translateZ(${h / 2}px)`,
            backfaceVisibility: "hidden",
          }}
        >
          {loc.city}
        </span>
        <span
          className="w-max"
          style={{
            display: "block",
            position: "absolute",
            top: 0,
            left: 0,
            transform: `rotateX(90deg) translateZ(${h / 2}px)`,
            backfaceVisibility: "hidden",
            color: loc.color,
          }}
        >
          {timeText}
        </span>
      </motion.span>
    </span>
  )
}
