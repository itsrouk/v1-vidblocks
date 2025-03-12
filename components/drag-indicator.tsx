"use client"

import { useDragLayer } from "react-dnd"
import { cn } from "@/lib/utils"

export function DragIndicator() {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }))

  if (!isDragging || !currentOffset) {
    return null
  }

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: currentOffset.x,
        top: currentOffset.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className={cn(
          "px-2 py-1 rounded bg-white shadow-lg border-2",
          item.type === "libraryClip" ? "border-blue-400" : "border-green-400",
        )}
      >
        <span className="text-xs font-medium">{item.type === "libraryClip" ? "Add to Timeline" : "Reorder"}</span>
      </div>
    </div>
  )
}

