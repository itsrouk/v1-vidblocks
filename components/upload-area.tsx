"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { useDrop } from "react-dnd"
import { Upload, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { VideoClip, ClipType } from "./video-builder"
import { v4 as uuidv4 } from "uuid"
import { cn } from "@/lib/utils"

interface UploadAreaProps {
  type: ClipType
  onUpload: (clips: VideoClip[]) => void
  tip: string
}

export default function UploadArea({ type, onUpload, tip }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "file",
    drop: (item: any, monitor) => {
      // Handle file drop from external source
      if (item.files) {
        handleFiles(item.files)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }, [])

  const handleFiles = async (fileList: FileList) => {
    const newClips: VideoClip[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]

      // Check if it's a video file
      if (!file.type.startsWith("video/")) {
        console.error("Not a video file:", file.name)
        continue
      }

      // Create a URL for the file
      const url = URL.createObjectURL(file)

      try {
        // Generate thumbnail
        const thumbnail = await generateVideoThumbnail(file)

        // Get video duration
        const duration = await getVideoDuration(file)

        newClips.push({
          id: uuidv4(),
          file,
          type,
          name: file.name,
          duration,
          thumbnail,
          url,
        })
      } catch (error) {
        console.error("Error processing video:", error)
      }
    }

    if (newClips.length > 0) {
      onUpload(newClips)
    }
  }

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const typeColors = {
    hook: "border-blue-300 bg-blue-50",
    body: "border-green-300 bg-green-50",
    cta: "border-purple-300 bg-purple-50",
  }

  const typeTitle = {
    hook: "Hook Clips",
    body: "Body Clips",
    cta: "CTA Clips",
  }

  return (
    <div
      ref={drop}
      className={cn(
        "border-2 border-dashed rounded-lg p-4 transition-colors",
        typeColors[type],
        (isDragging || isOver) && "border-gray-400 bg-gray-100",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <Upload className="h-10 w-10 mb-2 text-gray-400" />
        <h3 className="font-medium mb-1">{typeTitle[type]}</h3>
        <p className="text-sm text-gray-500 mb-3">Drag & drop or browse</p>
        <Button variant="outline" size="sm" onClick={handleBrowseClick}>
          Browse Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
      <div className="flex items-start mt-3 text-xs text-gray-500">
        <Info className="h-3 w-3 mr-1 mt-0.5" />
        <p>{tip}</p>
      </div>
    </div>
  )
}

// Helper function to generate a video thumbnail
const generateVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"

    video.onloadeddata = () => {
      try {
        // Seek to 1 second or the middle of the video
        video.currentTime = Math.min(1, video.duration / 2)
      } catch (e) {
        console.error("Error seeking video:", e)
      }
    }

    video.onseeked = () => {
      try {
        // Create canvas and draw video frame
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to data URL
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8)

        // Clean up
        URL.revokeObjectURL(video.src)
        resolve(dataUrl)
      } catch (e) {
        console.error("Error generating thumbnail:", e)
        reject(e)
      }
    }

    video.onerror = () => {
      console.error("Error loading video")
      URL.revokeObjectURL(video.src)
      reject(new Error("Error loading video"))
    }

    // Set video source
    video.src = URL.createObjectURL(file)
  })
}

// Helper function to get video duration
const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error("Error loading video"))
    }

    video.src = URL.createObjectURL(file)
  })
}

