"use client"

import { useState, useEffect, useRef } from "react"
import type { VideoClip } from "./video-builder"
import { Play, Pause, SkipForward, SkipBack } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface VideoPreviewProps {
  timeline: VideoClip[]
  generatedVideo: string | null
}

export default function VideoPreview({ timeline, generatedVideo }: VideoPreviewProps) {
  const [currentClipIndex, setCurrentClipIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Reset state when timeline changes
  useEffect(() => {
    setCurrentClipIndex(0)
    setIsPlaying(false)
    setProgress(0)
  }, [timeline])

  // Handle play/pause
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err)
          setIsPlaying(false)
        })
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying, currentClipIndex, timeline, generatedVideo])

  // Update progress
  useEffect(() => {
    const updateProgress = () => {
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime
        const duration = videoRef.current.duration
        setProgress((currentTime / duration) * 100)
      }
    }

    const interval = setInterval(updateProgress, 100)
    return () => clearInterval(interval)
  }, [])

  // Handle video ended
  const handleVideoEnded = () => {
    if (currentClipIndex < timeline.length - 1) {
      setCurrentClipIndex((prev) => prev + 1)
    } else {
      setIsPlaying(false)
      setProgress(0)
      setCurrentClipIndex(0)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    if (currentClipIndex > 0) {
      setCurrentClipIndex((prev) => prev - 1)
      setProgress(0)
    }
  }

  const handleNext = () => {
    if (currentClipIndex < timeline.length - 1) {
      setCurrentClipIndex((prev) => prev + 1)
      setProgress(0)
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const newTime = (value[0] / 100) * videoRef.current.duration
      videoRef.current.currentTime = newTime
      setProgress(value[0])
    }
  }

  const currentClip = timeline[currentClipIndex]
  const videoSrc = generatedVideo || currentClip?.url || ""

  return (
    <div>
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
        {timeline.length > 0 || generatedVideo ? (
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-contain"
            onEnded={handleVideoEnded}
            controls={!!generatedVideo}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <p>No clips in timeline</p>
          </div>
        )}
      </div>

      {!generatedVideo && timeline.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{currentClip?.name || "No clip selected"}</div>
            <div className="text-sm text-gray-500">
              {currentClipIndex + 1} / {timeline.length}
            </div>
          </div>

          <Slider value={[progress]} min={0} max={100} step={0.1} onValueChange={handleSeek} className="w-full" />

          <div className="flex items-center justify-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevious} disabled={currentClipIndex === 0}>
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentClipIndex === timeline.length - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {generatedVideo && (
        <div className="text-center text-sm text-green-600 font-medium">Final video generated successfully!</div>
      )}
    </div>
  )
}

