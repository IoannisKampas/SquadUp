"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  className?: string
  fallbackImage?: string
}

export function VideoPlayer({
  src,
  poster = "/placeholder.svg?height=720&width=1280&text=Video+Demo",
  title,
  className,
  fallbackImage,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Check if the source is a placeholder or not a valid video
  const isPlaceholder =
    src.includes("placeholder.svg") || src.includes("placeholder.jpg") || src.includes("placeholder.png")

  // Handle video error
  const handleVideoError = () => {
    setHasError(true)
    console.error("Video failed to load")
  }

  // Update video duration when metadata is loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  // Update progress as video plays
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      setCurrentTime(current)
      setProgress((current / duration) * 100)
    }
  }

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        // If it's a placeholder, don't actually try to play
        if (!isPlaceholder) {
          videoRef.current.play().catch((err) => {
            console.error("Failed to play video:", err)
            setHasError(true)
          })
        }
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }

  // Handle seeking
  const handleSeek = (value: number[]) => {
    const seekTo = (value[0] / 100) * duration
    setProgress(value[0])
    if (videoRef.current) {
      videoRef.current.currentTime = seekTo
      setCurrentTime(seekTo)
    }
  }

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }

  // Enter fullscreen
  const enterFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  // If we're using a placeholder or have an error, render a demo placeholder instead
  if (isPlaceholder || hasError) {
    return (
      <div className={cn("relative w-full aspect-video bg-black/5 rounded-lg overflow-hidden", className)}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="h-8 w-8 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{title || "Video Demo"}</h3>
          <p className="text-muted-foreground max-w-md">
            This is a placeholder for the video demonstration. In the actual implementation, this would play a video
            showing how the SquadUp service works.
          </p>
        </div>

        {/* Use an actual image as the background */}
        <Image
          src={fallbackImage || poster}
          alt={title || "Video Demo"}
          fill
          className="object-cover opacity-20 blur-sm"
          unoptimized
        />

        {/* Fake video controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="h-1 w-full bg-white/20 rounded-full mb-4">
            <div className="h-full w-[15%] bg-primary rounded-full"></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8">
                <Play className="h-4 w-4" />
              </Button>

              <span className="text-xs text-white">0:00 / 2:30</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8">
                <Volume2 className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8">
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render the actual video player if we have a valid source
  return (
    <div
      className={cn("relative group w-full aspect-video bg-black rounded-lg overflow-hidden", className)}
      onMouseEnter={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={handleVideoError}
      />

      {/* Video title overlay */}
      {title && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent text-white font-medium">
          {title}
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Progress bar */}
        <Slider value={[progress]} min={0} max={100} step={0.1} onValueChange={handleSeek} className="h-1 mb-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause button */}
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20 h-8 w-8">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            {/* Skip buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(-10)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(10)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Time display */}
            <span className="text-xs text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Volume control */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20 h-8 w-8">
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-20 h-1"
              />
            </div>

            {/* Fullscreen button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={enterFullscreen}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
