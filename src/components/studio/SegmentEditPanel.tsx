import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, RefreshCw, Image, Loader2, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export interface Segment {
  id: string;
  startTime: number;
  endTime: number;
  description: string;
  status: 'empty' | 'generating' | 'ready' | 'error';
  startFrame?: string;
  endFrame?: string;
}

interface SegmentEditPanelProps {
  segment: Segment;
  onUpdateSegment: (id: string, updates: Partial<Segment>) => void;
  onGenerateImages: (segment: Segment) => void;
  onClose: () => void;
}

export const SegmentEditPanel = ({
  segment,
  onUpdateSegment,
  onGenerateImages,
  onClose
}: SegmentEditPanelProps) => {
  const [description, setDescription] = useState(segment.description);
  const [imageDescription, setImageDescription] = useState("");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    onUpdateSegment(segment.id, { description: value });
  };

  const getStatusDisplay = () => {
    switch (segment.status) {
      case 'empty':
        return { text: '等待描述', color: 'text-muted-foreground', icon: null };
      case 'generating':
        return { text: '生成中...', color: 'text-primary', icon: Loader2 };
      case 'ready':
        return { text: '已就绪', color: 'text-green-500', icon: null };
      case 'error':
        return { text: '生成失败', color: 'text-destructive', icon: AlertCircle };
      default:
        return { text: '未知状态', color: 'text-muted-foreground', icon: null };
    }
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold">片段编辑</h3>
          <p className="text-sm text-muted-foreground">
            {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-4 space-y-6 overflow-auto">
        {/* 状态显示 */}
        <Card className="p-3 bg-secondary/50">
          <div className="flex items-center gap-2">
            {StatusIcon && <StatusIcon className={`h-4 w-4 ${status.color} ${segment.status === 'generating' ? 'animate-spin' : ''}`} />}
            <span className={`text-sm font-medium ${status.color}`}>
              {status.text}
            </span>
          </div>
        </Card>

        {/* 描述输入 */}
        <div className="space-y-2">
          <Label htmlFor="description">片段描述</Label>
          <Textarea
            id="description"
            placeholder="描述这个片段的内容，例如：一只可爱的猫咪在花园里玩耍..."
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            详细的描述有助于生成更准确的图像
          </p>
        </div>

        {/* 额外描述 */}
        <div className="space-y-2">
          <Label htmlFor="imageDescription">图像风格描述（可选）</Label>
          <Textarea
            id="imageDescription"
            placeholder="补充图像风格，例如：电影级画质，黄金时间光照，超高清..."
            value={imageDescription}
            onChange={(e) => setImageDescription(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* 生成按钮 */}
        <Button
          onClick={() => onGenerateImages(segment)}
          disabled={!description.trim() || segment.status === 'generating'}
          className="w-full"
        >
          {segment.status === 'generating' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Image className="h-4 w-4 mr-2" />
          )}
          生成图像
        </Button>

        <Separator />

        {/* 图像预览区域 */}
        <div className="space-y-4">
          <h4 className="font-medium">图像预览</h4>
          
          {/* 首帧 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>首帧</Label>
              {segment.startFrame && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onGenerateImages(segment)}
                  disabled={segment.status === 'generating'}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  重新生成
                </Button>
              )}
            </div>
            <Card className="aspect-video bg-secondary/30 rounded-lg overflow-hidden border-2 border-dashed border-border">
              {segment.startFrame ? (
                <img
                  src={segment.startFrame}
                  alt="首帧预览"
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    // 打开大图预览
                    window.open(segment.startFrame, '_blank');
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">首帧图像</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* 尾帧 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>尾帧</Label>
              {segment.endFrame && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onGenerateImages(segment)}
                  disabled={segment.status === 'generating'}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  重新生成
                </Button>
              )}
            </div>
            <Card className="aspect-video bg-secondary/30 rounded-lg overflow-hidden border-2 border-dashed border-border">
              {segment.endFrame ? (
                <img
                  src={segment.endFrame}
                  alt="尾帧预览"
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    // 打开大图预览
                    window.open(segment.endFrame, '_blank');
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">尾帧图像</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};