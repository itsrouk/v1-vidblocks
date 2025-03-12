"use client"

import { useDrag } from "react-dnd"
import type { Clip } from "@/types/clip"
import { Button } from "@/components/ui/button"
import { Plus, Clock } from "lucide-react"
import { formatDuration } from "@/lib/format-duration"

interface ClipItemProps {
  clip: Clip
  onAddToTimeline: () => void
}

export function ClipItem({ clip, onAddToTimeline }: ClipItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CLIP",
    item: { clip },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const getBorderColor = () => {
    switch (clip.type) {
      case "hooks":
        return "border-blue-500"
      case "body":
        return "border-green-500"
      case "cta":
        return "border-amber-500"
      default:
        return "border-gray-300"
    }
  }

  return (
    <div
      ref={drag}
      className={`relative rounded-md overflow-hidden border-2 ${getBorderColor()} ${
        isDragging ? "opacity-50" : "opacity-100"
      } cursor-move transition-opacity`}
      style={{ touchAction: "none" }}
    >
      <div className="aspect-video bg-gray-100 relative">
        <img src={clip.thumbnailUrl || "/placeholder.svg"} alt={clip.name} className="w-full h-full object-cover" />
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {formatDuration(clip.duration)}
        </div>
      </div>
      <div className="p-2 bg-white">
        <p className="text-xs font-medium truncate" title={clip.name}>
          {clip.name}
        </p>
        <Button size="sm" variant="ghost" className="w-full mt-1 h-7 text-xs" onClick={onAddToTimeline}>
          <Plus className="w-3 h-3 mr-1" /> Add to Timeline
        </Button>
      </div>
    </div>
  )
}

