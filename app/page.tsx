import VideoBuilder from "@/components/video-builder"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Video Blocks AI</h1>
        <p className="text-gray-600 mb-8">
          Upload your clips, arrange them in the timeline, and generate your final video.
        </p>
        <VideoBuilder />
      </div>
    </main>
  )
}

