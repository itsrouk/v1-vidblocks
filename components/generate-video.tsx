"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Film, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GenerateVideoProps {
  onGenerate: () => void
  isGenerating: boolean
  hasHook: boolean
  hasBody: boolean
  hasCta: boolean
  generatedVideoUrl: string | null
}

export function GenerateVideo({
  onGenerate,
  isGenerating,
  hasHook,
  hasBody,
  hasCta,
  generatedVideoUrl,
}: GenerateVideoProps) {
  const isReady = hasHook && hasBody && hasCta

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-lg">Generate Video</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {!isReady && (
            <Alert variant="warning">
              <AlertDescription>
                Please add at least one Hook, one Body, and one CTA clip to generate a video.
              </AlertDescription>
            </Alert>
          )}

          <Button className="w-full" size="lg" onClick={onGenerate} disabled={!isReady || isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Film className="mr-2 h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>

          {generatedVideoUrl && (
            <Button
              className="w-full"
              variant="outline"
              size="lg"
              as="a"
              href={generatedVideoUrl}
              download="generated-video.mp4"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Video
            </Button>
          )}

          <div className="text-xs text-gray-500 mt-2">
            <p>This will combine your clips with hard cuts (no gaps) in the order shown in the timeline.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

