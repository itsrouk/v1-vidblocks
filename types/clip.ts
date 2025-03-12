export type ClipType = "hooks" | "body" | "cta"

export interface Clip {
  id: string
  file: File
  type: ClipType
  name: string
  duration: number
  thumbnailUrl: string
}

export interface DragItem {
  type: string
  id: string
  index: number
  clip: Clip
}

