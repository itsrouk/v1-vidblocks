"use client"

import type { Clip } from "@/types/clip"
import { generateVideoFromTimeline as generateVideoAction } from "./generate-video-action"

export async function generateVideoFromTimeline(timeline: Clip[]): Promise<string> {
  try {
    // Extract the necessary data to pass to the server action
    const clipIds = timeline.map((clip) => clip.id)
    const clipUrls = timeline.map((clip) => clip.thumbnailUrl)

    // Call the server action
    return await generateVideoAction(clipIds, clipUrls)
  } catch (error) {
    console.error("Error generating video:", error)
    throw error
  }
}

