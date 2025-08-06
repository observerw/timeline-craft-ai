import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface Segment {
  id: string;
  startTime: number;
  endTime: number;
  description: string;
  status:
    | 'empty'
    | 'description-added'
    | 'generating'
    | 'ready'
    | 'description-modified'
    | 'video-ready'
    | 'error';
  startFrame?: string;
  endFrame?: string;
  referenceImage?: string;
  lastGeneratedDescription?: string;
}

interface TimelineEditorProps {
  segments: Segment[];
  selectedSegment: Segment | null;
  zoom: number;
  onCreateSegment: (duration: number) => void;
  onSelectSegment: (segment: Segment | null) => void;
  onUpdateSegment: (id: string, updates: Partial<Segment>) => void;
  onDeleteSegment: (id: string) => void;
  onZoomChange: (zoom: number) => void;
}

const TIMELINE_DURATION = 180; // 3分钟总时长
const BASE_PIXELS_PER_SECOND = 40; // 基础像素/秒

export const TimelineEditor = ({
  segments,
  selectedSegment,
  zoom,
  onCreateSegment,
  onSelectSegment,
  onUpdateSegment,
  onDeleteSegment,
  onZoomChange,
}: TimelineEditorProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const getTimeFromPosition = (x: number) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const relativeX = x - rect.left;
    return Math.max(
      0,
      Math.min(TIMELINE_DURATION, relativeX / (getPixelsPerSecond() * zoom))
    );
  };

  // 动态计算像素比例，确保时间轴适应容器宽度
  const getPixelsPerSecond = () => {
    if (containerWidth === 0) return BASE_PIXELS_PER_SECOND;
    const minWidth = containerWidth * 0.8; // 至少占容器80%宽度
    const calculatedPixelsPerSecond = minWidth / TIMELINE_DURATION;
    return Math.max(calculatedPixelsPerSecond, BASE_PIXELS_PER_SECOND * 0.5); // 最小不低于基础值的50%
  };

  const getPositionFromTime = (time: number) => {
    return time * getPixelsPerSecond() * zoom;
  };

  // 监听容器宽度变化
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);

    return () => {
      window.removeEventListener('resize', updateContainerWidth);
    };
  }, []);

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
      const duration = Math.abs(dragEnd - dragStart);

      if (duration > 0.5) {
        // 最小0.5秒
        onCreateSegment(duration);
      }
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const getStatusColor = (status: Segment['status']) => {
    switch (status) {
      case 'empty':
        return 'bg-muted/50 border-border text-muted-foreground';
      case 'description-added':
        return 'bg-primary/10 border-primary/30 text-primary';
      case 'generating':
        return 'bg-primary/20 border-primary/40 text-primary animate-glow-pulse';
      case 'ready':
        return 'bg-accent/70 border-accent text-accent-foreground';
      case 'description-modified':
        return 'bg-secondary border-border text-muted-foreground';
      case 'video-ready':
        return 'bg-accent border-accent text-accent-foreground';
      case 'error':
        return 'bg-destructive/10 border-destructive/30 text-destructive';
      default:
        return 'bg-muted/50 border-border text-muted-foreground';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-2 sm:p-4 bg-card/50 backdrop-blur">
      {/* 时间轴控制 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
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

        <div className="text-xs sm:text-sm text-muted-foreground">
          <span className="hidden sm:inline">
            拖拽创建片段，自动吸附到末尾 •{' '}
          </span>
          总时长: {formatTime(TIMELINE_DURATION)}
        </div>
      </div>

      {/* 时间轴容器 - 统一滚动 */}
      <div ref={containerRef} className="overflow-x-auto border rounded-lg">
        <div
          className="relative"
          style={{
            width: `${TIMELINE_DURATION * getPixelsPerSecond() * zoom}px`,
            minWidth: '100%',
          }}
        >
          {/* 时间刻度 */}
          <div className="relative mb-2">
            <div
              className="flex text-xs text-muted-foreground"
              style={{
                width: `${TIMELINE_DURATION * getPixelsPerSecond() * zoom}px`,
                minWidth: '100%',
              }}
            >
              {Array.from(
                { length: Math.ceil(TIMELINE_DURATION / 5) + 1 },
                (_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0"
                    style={{ width: `${5 * getPixelsPerSecond() * zoom}px` }}
                  >
                    {formatTime(i * 5)}
                  </div>
                )
              )}
            </div>
          </div>

          {/* 时间轴主体 */}
          <div
            ref={timelineRef}
            className="relative h-20 bg-secondary/30 rounded-lg border border-border cursor-crosshair"
            style={{
              width: `${TIMELINE_DURATION * getPixelsPerSecond() * zoom}px`,
              minWidth: '100%',
            }}
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
                style={{ left: `${i * getPixelsPerSecond() * zoom}px` }}
              />
            ))}

            {/* 拖拽预览 */}
            {isDragging && dragStart !== null && dragEnd !== null && (
              <div
                className="absolute top-2 bottom-2 bg-primary/30 border border-primary rounded"
                style={{
                  left: `${getPositionFromTime(Math.min(dragStart, dragEnd))}px`,
                  width: `${getPositionFromTime(Math.abs(dragEnd - dragStart))}px`,
                }}
              />
            )}

            {/* 片段 - 显示连贯排列的位置 */}
            {(() => {
              let currentTime = 0;
              return segments.map((segment) => {
                const segmentStartTime = currentTime;
                const segmentDuration = segment.endTime - segment.startTime;
                currentTime += segmentDuration;

                return (
                  <div
                    key={segment.id}
                    className="absolute top-2 bottom-2 group hover:z-10"
                  >
                    <div
                      className={cn(
                        'h-full rounded border-2 transition-all cursor-pointer relative',
                        getStatusColor(segment.status),
                        selectedSegment?.id === segment.id
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : ''
                      )}
                      style={{
                        left: `${getPositionFromTime(segmentStartTime)}px`,
                        width: `${getPositionFromTime(segmentDuration)}px`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // 如果点击的是已选中的片段，则取消选中；否则选中该片段
                        if (selectedSegment?.id === segment.id) {
                          onSelectSegment(null);
                        } else {
                          onSelectSegment(segment);
                        }
                      }}
                    >
                      <div className="p-2 text-xs font-medium truncate">
                        {segment.description || '未命名片段'}
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
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* 时间显示 */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>0:00</span>
        <span>{formatTime(TIMELINE_DURATION)}</span>
      </div>
    </Card>
  );
};
