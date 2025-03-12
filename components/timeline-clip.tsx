"use client"

import { useDrag, useDrop } from "react-dnd"
import type { Clip } from "@/types/clip"
import { X, GripVertical } from "lucide-react"
import { formatDuration } from "@/lib/format-duration"

interface TimelineClipProps {
  clip: Clip
  index: number
  onRemove: () => void
  isDragged: boolean
  isDropTarget: boolean
  onReorder: (startIndex: number, endIndex: number) => void
}

export function TimelineClip({ clip, index, onRemove, isDragged, isDropTarget, onReorder }: TimelineClipProps) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "TIMELINE_CLIP",
    item: { type: "TIMELINE_CLIP", index, clip },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TIMELINE_CLIP",
    drop: (item: any) => {
      if (item.index !== undefined && item.index !== index) {
        onReorder(item.index, index)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const getTypeColor = () => {
    switch (clip.type) {
      case "hooks":
        return "bg-blue-100 border-blue-300"
      case "body":
        return "bg-green-100 border-green-300"
      case "cta":
        return "bg-amber-100 border-amber-300"
      default:
        return "bg-gray-100 border-gray-300"
    }
  }

  const getTypeLabel = () => {
    switch (clip.type) {
      case "hooks":
        return "Hook"
      case "body":
        return "Body"
      case "cta":
        return "CTA"
      default:
        return "Clip"
    }
  }

  return (
    <div
      ref={(node) => {
        drop(node)
        preview(node)
      }}
      className={`relative border rounded-md overflow-hidden transition-all ${getTypeColor()} ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${isOver ? "scale-105" : "scale-100"} ${isDropTarget ? "border-dashed border-2 border-blue-500" : ""}`}
      style={{ width: "150px", touchAction: "none" }}
    >
      <div className="p-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold">
            {getTypeLabel()} #{index + 1}
          </span>
          <button
            onClick={onRemove}
            className="text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Remove clip"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="aspect-video bg-gray-800 rounded overflow-hidden mb-1">
          <img src={clip.thumbnailUrl || "/placeholder.svg"} alt={clip.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs truncate" title={clip.name}>
            {clip.name}
          </span>
          <span className="text-xs text-gray-500">{formatDuration(clip.duration)}</span>
        </div>
      </div>
      <div
        ref={drag}
        className="absolute top-0 left-0 w-full h-8 cursor-move flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-gray-500" />
      </div>
    </div>
  )
}

