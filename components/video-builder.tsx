"use client"

import { useState, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import UploadArea from "./upload-area"
import Timeline from "./timeline"
import VideoPreview from "./video-preview"
import { generateVideo } from "@/actions/video-actions"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DragIndicator } from "./drag-indicator"

export type ClipType = "hook" | "body" | "cta"

export interface VideoClip {
  id: string
  file: File
  type: ClipType
  name: string
  duration: number
  thumbnail?: string
  url: string
}

export default function VideoBuilder() {
  const [hookClips, setHookClips] = useState<VideoClip[]>([])
  const [bodyClips, setBodyClips] = useState<VideoClip[]>([])
  const [ctaClips, setCtaClips] = useState<VideoClip[]>([])
  const [timeline, setTimeline] = useState<VideoClip[]>([])
  const [generating, setGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const handleUpload = useCallback((clips: VideoClip[], type: ClipType) => {
    switch (type) {
      case "hook":
        setHookClips((prev) => [...prev, ...clips])
        break
      case "body":
        setBodyClips((prev) => [...prev, ...clips])
        break
      case "cta":
        setCtaClips((prev) => [...prev, ...clips])
        break
    }
  }, [])

  const handleAddToTimeline = useCallback((clip: VideoClip) => {
    setTimeline((prev) => [...prev, clip])
  }, [])

  const handleReorderTimeline = useCallback((dragIndex: number, hoverIndex: number) => {
    setTimeline((prevTimeline) => {
      const newTimeline = [...prevTimeline]
      const [removed] = newTimeline.splice(dragIndex, 1)
      newTimeline.splice(hoverIndex, 0, removed)
      return newTimeline
    })
  }, [])

  const handleRemoveFromTimeline = useCallback((clipId: string) => {
    setTimeline((prev) => prev.filter((clip) => clip.id !== clipId))
  }, [])

  const handleGenerateVideo = async () => {
    if (timeline.length === 0) {
      setError("Please add at least one clip to the timeline")
      return
    }

    if (!hasRequiredClips()) {
      setError("Your timeline must include at least one hook, one body, and one CTA clip")
      return
    }

    try {
      setGenerating(true)
      setError(null)
      setSuccess(false)

      // In a real implementation, you would send the actual files
      // Here we're simulating the response
      const clipIds = timeline.map((clip) => clip.id)
      const result = await generateVideo(clipIds)

      if (result.success) {
        setGeneratedVideo(result.videoUrl)
        setSuccess(true)
      } else {
        setError(result.error || "Failed to generate video")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const hasRequiredClips = () => {
    const hasHook = timeline.some((clip) => clip.type === "hook")
    const hasBody = timeline.some((clip) => clip.type === "body")
    const hasCta = timeline.some((clip) => clip.type === "cta")
    return hasHook && hasBody && hasCta
  }

  const resetTimeline = () => {
    setTimeline([])
    setGeneratedVideo(null)
    setError(null)
    setSuccess(false)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UploadArea
              type="hook"
              onUpload={(clips) => handleUpload(clips, "hook")}
              tip="Short attention-grabbing clips (5-10 seconds)"
            />
            <UploadArea
              type="body"
              onUpload={(clips) => handleUpload(clips, "body")}
              tip="Main content clips (30-60 seconds)"
            />
            <UploadArea
              type="cta"
              onUpload={(clips) => handleUpload(clips, "cta")}
              tip="Call-to-action clips (5-15 seconds)"
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Timeline</h2>
              <Button variant="outline" onClick={resetTimeline} disabled={timeline.length === 0}>
                Reset Timeline
              </Button>
            </div>
            <Timeline
              timeline={timeline}
              hookClips={hookClips}
              bodyClips={bodyClips}
              ctaClips={ctaClips}
              onAddToTimeline={handleAddToTimeline}
              onReorderTimeline={handleReorderTimeline}
              onRemoveFromTimeline={handleRemoveFromTimeline}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerateVideo}
              disabled={generating || timeline.length === 0 || !hasRequiredClips()}
              className="px-6"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Video...
                </>
              ) : (
                "Generate Video"
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">
                Your video has been generated successfully!
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <VideoPreview timeline={timeline} generatedVideo={generatedVideo} />
        </div>
      </div>
      <DragIndicator />
    </DndProvider>
  )
}

