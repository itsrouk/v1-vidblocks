"use client"

import { useCallback, useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import type { VideoClip } from "./video-builder"
import { X, GripVertical, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineProps {
  timeline: VideoClip[]
  hookClips: VideoClip[]
  bodyClips: VideoClip[]
  ctaClips: VideoClip[]
  onAddToTimeline: (clip: VideoClip) => void
  onReorderTimeline: (newTimeline: VideoClip[]) => void
  onRemoveFromTimeline: (clipId: string) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

const ClipItem = ({
  clip,
  index,
  onRemove,
  onReorder,
}: {
  clip: VideoClip
  index: number
  onRemove: (id: string) => void
  onReorder: (dragIndex: number, hoverIndex: number) => void
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: "timelineClip",
    item: () => ({ type: "timelineClip", id: clip.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ handlerId }, drop] = useDrop({
    accept: "timelineClip",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return
      }

      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect()

      // Get horizontal middle
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      if (!clientOffset) {
        return
      }

      // Get pixels to the left
      const hoverClientX = clientOffset.x - hoverBoundingRect.left

      // Only perform the move when the mouse has crossed half of the items width

      // Dragging right
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return
      }

      // Dragging left
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return
      }

      // Time to actually perform the action
      onReorder(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      item.index = hoverIndex
    },
  })

  // Combine the drag and drop refs
  const dragDropRef = (node: HTMLDivElement | null) => {
    ref.current = node
    drag(drop(node))
  }

  const typeColors = {
    hook: "bg-blue-100 border-blue-300",
    body: "bg-green-100 border-green-300",
    cta: "bg-purple-100 border-purple-300",
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div
      ref={dragDropRef}
      className={cn(
        "flex items-center p-2 mb-2 border rounded-md transition-opacity",
        typeColors[clip.type],
        isDragging ? "opacity-50" : "opacity-100",
      )}
      data-handler-id={handlerId}
    >
      <div className="cursor-move p-1 mr-2">
        <GripVertical className="h-5 w-5 text-gray-500" />
      </div>

      <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden mr-3 flex-shrink-0">
        {clip.thumbnail && (
          <img src={clip.thumbnail || "/placeholder.svg"} alt={clip.name} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="flex-grow min-w-0">
        <div className="font-medium truncate">{clip.name}</div>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Clock className="h-3 w-3 mr-1" />
          <span>{formatDuration(clip.duration)}</span>
        </div>
      </div>

      <button
        onClick={() => onRemove(clip.id)}
        className="p-1 ml-2 text-gray-500 hover:text-red-500 transition-colors"
        aria-label="Remove clip"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

const ClipLibrary = ({
  clips,
  onAddToTimeline,
}: {
  clips: VideoClip[]
  onAddToTimeline: (clip: VideoClip) => void
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "libraryClip",
    drop: (item: any) => {
      const clip = clips.find((c) => c.id === item.id)
      if (clip) {
        onAddToTimeline(clip)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  if (clips.length === 0) {
    return null
  }

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">Available Clips</h3>
      <div className="flex flex-wrap gap-2">
        {clips.map((clip) => (
          <LibraryClipItem key={clip.id} clip={clip} onAddToTimeline={onAddToTimeline} />
        ))}
      </div>
    </div>
  )
}

const LibraryClipItem = ({
  clip,
  onAddToTimeline,
}: {
  clip: VideoClip
  onAddToTimeline: (clip: VideoClip) => void
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "libraryClip",
    item: { type: "libraryClip", id: clip.id },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{ dropped?: boolean }>()
      // If not dropped on a droppable target, add to timeline when drag ends
      if (!dropResult?.dropped) {
        onAddToTimeline(clip)
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const typeColors = {
    hook: "bg-blue-100 border-blue-300",
    body: "bg-green-100 border-green-300",
    cta: "bg-purple-100 border-purple-300",
  }

  const typeLabels = {
    hook: "Hook",
    body: "Body",
    cta: "CTA",
  }

  return (
    <div
      ref={drag}
      className={cn(
        "cursor-grab border rounded p-1 flex items-center transition-opacity group",
        typeColors[clip.type],
        isDragging ? "opacity-50" : "opacity-100",
      )}
      onClick={() => onAddToTimeline(clip)}
    >
      <div className="h-10 w-16 bg-gray-200 rounded overflow-hidden mr-2 flex-shrink-0 relative">
        {clip.thumbnail && (
          <img src={clip.thumbnail || "/placeholder.svg"} alt={clip.name} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-opacity">
          <GripVertical className="h-4 w-4 text-white opacity-0 group-hover:opacity-100" />
        </div>
      </div>
      <div className="text-xs">
        <div className="font-medium truncate max-w-[100px]">{clip.name}</div>
        <div className="text-gray-500">{typeLabels[clip.type]}</div>
      </div>
    </div>
  )
}

export default function Timeline({
  timeline,
  hookClips,
  bodyClips,
  ctaClips,
  onAddToTimeline,
  onReorderTimeline,
  onRemoveFromTimeline,
}: TimelineProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ["libraryClip", "timelineClip"],
    drop: (item: any) => {
      // Handle drop from library
      if (item.type === "libraryClip") {
        const clip = [...hookClips, ...bodyClips, ...ctaClips].find((c) => c.id === item.id)
        if (clip) {
          onAddToTimeline(clip)
          return { dropped: true }
        }
      }
      return undefined
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const moveClip = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const newTimeline = [...timeline]
      const draggedClip = newTimeline[dragIndex]

      // Remove the dragged item
      newTimeline.splice(dragIndex, 1)
      // Insert it at the new position
      newTimeline.splice(hoverIndex, 0, draggedClip)

      onReorderTimeline(newTimeline)
    },
    [timeline, onReorderTimeline],
  )

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ClipLibrary clips={hookClips} onAddToTimeline={onAddToTimeline} />
        <ClipLibrary clips={bodyClips} onAddToTimeline={onAddToTimeline} />
        <ClipLibrary clips={ctaClips} onAddToTimeline={onAddToTimeline} />
      </div>

      <div
        ref={drop}
        className={cn(
          "min-h-[200px] border-2 border-dashed rounded-lg p-4 transition-colors",
          isOver ? "border-blue-500 bg-blue-50" : "border-gray-200",
          timeline.length === 0 && "flex items-center justify-center",
        )}
      >
        {timeline.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="mb-2">Drag clips here to build your timeline</p>
            {isOver && <p className="text-blue-500 font-medium">Drop to add to timeline!</p>}
          </div>
        ) : (
          <div>
            {timeline.map((clip, index) => (
              <ClipItem
                key={`${clip.id}-${index}`}
                clip={clip}
                index={index}
                onRemove={onRemoveFromTimeline}
                onReorder={moveClip}
              />
            ))}
            {isOver && (
              <div className="border-2 border-dashed border-blue-500 rounded-md p-4 bg-blue-50 text-center text-blue-500">
                Drop here to add to timeline
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

