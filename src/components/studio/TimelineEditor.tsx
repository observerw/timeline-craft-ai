import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Segment {
  id: string;
  startTime: number;
  endTime: number;
  description: string;
  status: 'empty' | 'generating' | 'ready' | 'error';
  startFrame?: string;
  endFrame?: string;
}

interface TimelineEditorProps {
  segments: Segment[];
  selectedSegment: Segment | null;
  zoom: number;
  onCreateSegment: (startTime: number, endTime: number) => void;
  onSelectSegment: (segment: Segment | null) => void;
  onUpdateSegment: (id: string, updates: Partial<Segment>) => void;
  onDeleteSegment: (id: string) => void;
  onZoomChange: (zoom: number) => void;
}

const TIMELINE_DURATION = 60; // 60秒总时长
const PIXELS_PER_SECOND = 40; // 基础像素/秒

export const TimelineEditor = ({
  segments,
  selectedSegment,
  zoom,
  onCreateSegment,
  onSelectSegment,
  onUpdateSegment,
  onDeleteSegment,
  onZoomChange
}: TimelineEditorProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);

  const getTimeFromPosition = (x: number) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const relativeX = x - rect.left;
    return Math.max(0, Math.min(TIMELINE_DURATION, relativeX / (PIXELS_PER_SECOND * zoom)));
  };

  const getPositionFromTime = (time: number) => {
    return time * PIXELS_PER_SECOND * zoom;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const time = getTimeFromPosition(e.clientX);
    setIsDragging(true);
    setDragStart(time);
    setDragEnd(time);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStart === null) return;
    const time = getTimeFromPosition(e.clientX);
    setDragEnd(time);
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart !== null && dragEnd !== null) {
      const startTime = Math.min(dragStart, dragEnd);
      const endTime = Math.max(dragStart, dragEnd);
      
      if (endTime - startTime > 0.5) { // 最小0.5秒
        onCreateSegment(startTime, endTime);
      }
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const getStatusColor = (status: Segment['status']) => {
    switch (status) {
      case 'empty': return 'bg-muted border-border';
      case 'generating': return 'bg-primary/20 border-primary animate-glow-pulse';
      case 'ready': return 'bg-primary/40 border-primary';
      case 'error': return 'bg-destructive/20 border-destructive';
      default: return 'bg-muted border-border';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur">
      {/* 时间轴控制 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoomChange(Math.max(0.5, zoom - 0.25))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoomChange(Math.min(3, zoom + 0.25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          拖拽创建片段 • 总时长: {formatTime(TIMELINE_DURATION)}
        </div>
      </div>

      {/* 时间刻度 */}
      <div className="relative mb-2">
        <div className="flex text-xs text-muted-foreground">
          {Array.from({ length: Math.ceil(TIMELINE_DURATION / 5) + 1 }, (_, i) => (
            <div
              key={i}
              className="flex-shrink-0"
              style={{ width: `${5 * PIXELS_PER_SECOND * zoom}px` }}
            >
              {formatTime(i * 5)}
            </div>
          ))}
        </div>
      </div>

      {/* 时间轴主体 */}
      <div
        ref={timelineRef}
        className="relative h-20 bg-secondary/30 rounded-lg border border-border cursor-crosshair overflow-hidden"
        style={{ width: `${TIMELINE_DURATION * PIXELS_PER_SECOND * zoom}px` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 时间刻度线 */}
        {Array.from({ length: TIMELINE_DURATION + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-border/50"
            style={{ left: `${i * PIXELS_PER_SECOND * zoom}px` }}
          />
        ))}

        {/* 拖拽预览 */}
        {isDragging && dragStart !== null && dragEnd !== null && (
          <div
            className="absolute top-2 bottom-2 bg-primary/30 border border-primary rounded"
            style={{
              left: `${getPositionFromTime(Math.min(dragStart, dragEnd))}px`,
              width: `${getPositionFromTime(Math.abs(dragEnd - dragStart))}px`
            }}
          />
        )}

        {/* 片段 */}
        {segments.map((segment) => (
          <div key={segment.id} className="absolute top-2 bottom-2 group">
            <div
              className={cn(
                "h-full rounded border-2 transition-all cursor-pointer relative",
                getStatusColor(segment.status),
                selectedSegment?.id === segment.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
              )}
              style={{
                left: `${getPositionFromTime(segment.startTime)}px`,
                width: `${getPositionFromTime(segment.endTime - segment.startTime)}px`
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSegment(segment);
              }}
            >
              <div className="p-2 text-xs font-medium truncate">
                {segment.description || "未命名片段"}
              </div>
              
              {/* 状态指示器 */}
              <div className="absolute top-1 right-1">
                {segment.status === 'generating' && (
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
                {segment.status === 'ready' && (
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                )}
                {segment.status === 'error' && (
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                )}
              </div>

              {/* 删除按钮 */}
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSegment(segment.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 时间显示 */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>0:00</span>
        <span>{formatTime(TIMELINE_DURATION)}</span>
      </div>
    </Card>
  );
};