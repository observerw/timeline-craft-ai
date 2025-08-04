import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Download, Save, HelpCircle } from "lucide-react";
import { TimelineEditor } from "@/components/studio/TimelineEditor";
import { SegmentEditPanel } from "@/components/studio/SegmentEditPanel";
import { VideoPlayer } from "@/components/studio/VideoPlayer";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export interface Segment {
  id: string;
  startTime: number;
  endTime: number;
  description: string;
  status: 'empty' | 'generating' | 'ready' | 'error';
  startFrame?: string;
  endFrame?: string;
}

const Studio = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState(1);

  const handleCreateSegment = (duration: number) => {
    // 计算新片段的开始时间（紧接着最后一个片段）
    const totalDuration = segments.reduce((sum, seg) => sum + (seg.endTime - seg.startTime), 0);
    
    const newSegment: Segment = {
      id: crypto.randomUUID(),
      startTime: totalDuration,
      endTime: totalDuration + duration,
      description: '',
      status: 'empty'
    };
    setSegments([...segments, newSegment]);
    setSelectedSegment(newSegment);
  };

  const handleUpdateSegment = (id: string, updates: Partial<Segment>) => {
    setSegments(segments.map(seg => 
      seg.id === id ? { ...seg, ...updates } : seg
    ));
    if (selectedSegment?.id === id) {
      setSelectedSegment({ ...selectedSegment, ...updates });
    }
  };

  const handleDeleteSegment = (id: string) => {
    setSegments(segments.filter(seg => seg.id !== id));
    if (selectedSegment?.id === id) {
      setSelectedSegment(null);
    }
  };

  const handleGenerateImages = async (segment: Segment) => {
    if (!segment.description.trim()) {
      toast.error("请先添加片段描述");
      return;
    }

    handleUpdateSegment(segment.id, { status: 'generating' });
    
    try {
      // 模拟图像生成 API 调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟生成的图像 URLs
      const startFrame = `https://picsum.photos/800/600?random=${segment.id}-start`;
      const endFrame = `https://picsum.photos/800/600?random=${segment.id}-end`;
      
      handleUpdateSegment(segment.id, { 
        status: 'ready', 
        startFrame, 
        endFrame 
      });
      
      toast.success("图像生成成功！");
    } catch (error) {
      handleUpdateSegment(segment.id, { status: 'error' });
      toast.error("图像生成失败，请重试");
    }
  };

  const handleGenerateVideo = async () => {
    const readySegments = segments.filter(seg => seg.status === 'ready');
    if (readySegments.length === 0) {
      toast.error("请先生成所有片段的图像");
      return;
    }

    setIsGeneratingVideo(true);
    
    try {
      // 模拟视频生成 API 调用
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 模拟生成的视频 URL
      const videoUrl = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
      setGeneratedVideo(videoUrl);
      
      toast.success("视频生成成功！");
    } catch (error) {
      toast.error("视频生成失败，请重试");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const canGenerateVideo = segments.length > 0 && 
    segments.every(seg => seg.status === 'ready');

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Play className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold">VideoMaker Studio</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              帮助
            </Button>
            <Link to="/projects">
              <Button 
                variant="outline" 
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                项目
              </Button>
            </Link>
            <Button 
              variant="default" 
              size="sm"
              disabled={!generatedVideo}
            >
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* 主编辑区域 */}
        <div className="flex-1 flex flex-col">
          {/* 视频播放器区域 */}
          <div className="flex-1 p-6">
            <VideoPlayer 
              videoUrl={generatedVideo}
              segments={segments}
              onTimeChange={(time) => {
                // 处理时间跳转
              }}
            />
          </div>

          {/* 时间轴编辑器 */}
          <div className="border-t border-border bg-card/30">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">时间轴编辑器</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleGenerateVideo}
                    disabled={!canGenerateVideo || isGeneratingVideo}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isGeneratingVideo ? (
                      <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    生成视频
                  </Button>
                </div>
              </div>
              
              <TimelineEditor
                segments={segments}
                selectedSegment={selectedSegment}
                zoom={timelineZoom}
                onCreateSegment={handleCreateSegment}
                onSelectSegment={setSelectedSegment}
                onUpdateSegment={handleUpdateSegment}
                onDeleteSegment={handleDeleteSegment}
                onZoomChange={setTimelineZoom}
              />
            </div>
          </div>
        </div>

        {/* 右侧编辑面板 */}
        {selectedSegment && (
          <div className="w-96 border-l border-border bg-card/30 animate-slide-in">
            <SegmentEditPanel
              segment={selectedSegment}
              onUpdateSegment={handleUpdateSegment}
              onGenerateImages={handleGenerateImages}
              onClose={() => setSelectedSegment(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Studio;