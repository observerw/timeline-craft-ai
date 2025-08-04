import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export interface Segment {
  id: string;
  startTime: number;
  endTime: number;
  description: string;
  status: 'empty' | 'generating' | 'ready' | 'error';
}

interface VideoPlayerProps {
  videoUrl: string | null;
  segments: Segment[];
  onTimeChange?: (time: number) => void;
}

export const VideoPlayer = ({ videoUrl, segments, onTimeChange }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeChange?.(video.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handlePlayPause = () => {
      setIsPlaying(!video.paused);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlayPause);
    video.addEventListener('pause', handlePlayPause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlayPause);
      video.removeEventListener('pause', handlePlayPause);
    };
  }, [onTimeChange]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      video.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentSegment = () => {
    return segments.find(segment => 
      currentTime >= segment.startTime && currentTime <= segment.endTime
    );
  };

  const currentSegment = getCurrentSegment();

  return (
    <Card className="bg-black/90 backdrop-blur border-border/50 overflow-hidden">
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onClick={handlePlayPause}
            onLoadedMetadata={() => {
              setDuration(videoRef.current?.duration || 0);
            }}
          >
            您的浏览器不支持视频播放
          </video>
        ) : (
          <div className="text-center text-white/70">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
              <Play className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-medium mb-2">准备开始创作</h3>
            <p className="text-sm text-white/50">
              创建片段并生成图像后，点击"生成视频"来制作您的作品
            </p>
          </div>
        )}

        {/* 当前片段指示 */}
        {currentSegment && videoUrl && (
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            正在播放: {currentSegment.description || "未命名片段"}
          </div>
        )}

        {/* 播放控制覆盖层 */}
        {videoUrl && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center group"
               onClick={handlePlayPause}>
            {!isPlaying && (
              <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                <Play className="h-8 w-8 text-white ml-1" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 控制栏 */}
      {videoUrl && (
        <div className="p-4 bg-card/80 backdrop-blur space-y-3">
          {/* 进度条 */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
            />
            
            {/* 时间轴片段指示 */}
            <div className="relative h-2">
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className={cn(
                    "absolute h-full rounded-sm",
                    segment.status === 'ready' ? "bg-primary/60" : "bg-muted/60"
                  )}
                  style={{
                    left: `${(segment.startTime / duration) * 100}%`,
                    width: `${((segment.endTime - segment.startTime) / duration) * 100}%`
                  }}
                />
              ))}
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                className="h-8 w-8 p-0 text-foreground hover:text-primary"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMuteToggle}
                  className="h-8 w-8 p-0 text-foreground hover:text-primary"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>

              <div className="text-sm text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreen}
              className="h-8 w-8 p-0 text-foreground hover:text-primary"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};