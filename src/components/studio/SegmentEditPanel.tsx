import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Image,
  Loader2,
  RefreshCw,
  Upload,
  Video,
  X,
  XCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';

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
  lastGeneratedDescription?: string; // 用于跟踪上次生成图像时的描述
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
  onClose,
}: SegmentEditPanelProps) => {
  const [description, setDescription] = useState(segment.description);
  const [imageDescription, setImageDescription] = useState('');
  const [regenerateFeedback, setRegenerateFeedback] = useState('');
  const [regenerateType, setRegenerateType] = useState<
    'start' | 'end' | 'both'
  >('both');
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);

    // 根据描述变化更新状态
    let newStatus = segment.status;
    if (value.trim() === '') {
      newStatus = 'empty';
    } else if (segment.status === 'empty') {
      newStatus = 'description-added';
    } else if (segment.status === 'ready' || segment.status === 'video-ready') {
      // 如果描述与上次生成时不同，标记为已修改
      if (
        segment.lastGeneratedDescription &&
        value !== segment.lastGeneratedDescription
      ) {
        newStatus = 'description-modified';
      }
    }

    onUpdateSegment(segment.id, { description: value, status: newStatus });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }

      // 检查文件大小 (限制为5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('图片文件大小不能超过5MB');
        return;
      }

      // 创建预览URL
      const imageUrl = URL.createObjectURL(file);
      onUpdateSegment(segment.id, { referenceImage: imageUrl });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveReference = () => {
    if (segment.referenceImage) {
      URL.revokeObjectURL(segment.referenceImage);
    }
    onUpdateSegment(segment.id, { referenceImage: undefined });
  };

  const handleRegenerateClick = (
    type: 'start' | 'end' | 'both',
    buttonId: string
  ) => {
    setRegenerateType(type);
    setRegenerateFeedback('');
    setOpenPopover(buttonId);
  };

  const handleRegenerateConfirm = async () => {
    if (!regenerateFeedback.trim()) {
      return;
    }

    // 根据用户反馈更新描述
    const updatedDescription = `${description}\n\n反馈优化：${regenerateFeedback}`;

    // 更新片段描述
    onUpdateSegment(segment.id, {
      description: updatedDescription,
      status: 'description-modified',
    });

    // 更新本地描述状态
    setDescription(updatedDescription);

    // 关闭弹窗
    setOpenPopover(null);

    // 重新生成图像
    onGenerateImages({
      ...segment,
      description: updatedDescription,
    });
  };

  const getStatusDisplay = () => {
    switch (segment.status) {
      case 'empty':
        return {
          text: '等待描述',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/30 border-border',
          icon: Clock,
          description: '请添加片段描述以开始生成图像',
        };
      case 'description-added':
        return {
          text: '描述已添加',
          color: 'text-primary',
          bgColor: 'bg-primary/10 border-primary/20',
          icon: FileText,
          description: '描述已添加，点击生成图像按钮开始创建首尾帧',
        };
      case 'generating':
        return {
          text: '生成中',
          color: 'text-primary',
          bgColor: 'bg-primary/20 border-primary/30',
          icon: Loader2,
          description: 'AI正在生成片段的首尾帧图像，请稍候...',
        };
      case 'ready':
        return {
          text: '图像已生成',
          color: 'text-primary',
          bgColor: 'bg-accent/50 border-accent',
          icon: CheckCircle,
          description: '首尾帧图像已生成完成，可以进行视频合成',
        };
      case 'description-modified':
        return {
          text: '描述已修改',
          color: 'text-muted-foreground',
          bgColor: 'bg-secondary border-border',
          icon: AlertTriangle,
          description: '描述已修改，请重新生成首尾帧图像',
        };
      case 'video-ready':
        return {
          text: '视频已生成',
          color: 'text-accent-foreground',
          bgColor: 'bg-accent border-accent',
          icon: Video,
          description: '该片段已参与视频生成，视频制作完成',
        };
      case 'error':
        return {
          text: '生成失败',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10 border-destructive/20',
          icon: XCircle,
          description: '图像生成过程中出现错误，请检查描述后重试',
        };
      default:
        return {
          text: '未知状态',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/30 border-border',
          icon: Clock,
          description: '片段状态未知',
        };
    }
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  return (
    <div className="h-full overflow-scroll flex flex-col bg-card/50 backdrop-blur">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
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
      <div className="flex-1 p-4 space-y-6 overflow-y-auto min-h-0">
        {/* 状态显示 */}
        <Card className={`p-4 border-2 ${status.bgColor}`}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {StatusIcon && (
                <StatusIcon
                  className={`h-4 w-4 ${status.color} ${
                    segment.status === 'generating' ? 'animate-spin' : ''
                  }`}
                />
              )}
              <span className={`text-sm font-semibold ${status.color}`}>
                {status.text}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {status.description}
            </p>
          </div>
        </Card>

        {/* 描述输入 */}
        <div className="space-y-3">
          <Label htmlFor="description">片段描述</Label>

          {/* 三要素指导 */}
          <Card className="p-3 bg-primary/5 border-primary/20">
            <div className="text-sm space-y-1">
              <p className="font-medium text-primary mb-2">描述三要素：</p>
              <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                <span>
                  <strong>主体：</strong>画面中的人物、动物、物体等主体
                </span>
                <span>
                  <strong>运动：</strong>目标主体希望实现的运动轨迹
                </span>
                <span>
                  <strong>背景：</strong>画面中的背景环境
                </span>
              </div>
            </div>
          </Card>

          <AutosizeTextarea
            id="description"
            placeholder="例如：一只橘色小猫（主体）在阳光明媚的花园里缓慢行走（运动），周围有盛开的鲜花和绿色草地（背景）"
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            minHeight={120}
            maxHeight={300}
          />
          <p className="text-xs text-muted-foreground">
            按照主体、运动、背景三要素描述，有助于生成更准确的图像
          </p>
        </div>

        {/* 额外描述 */}
        <div className="space-y-2">
          <Label htmlFor="imageDescription">图像风格描述（可选）</Label>
          <AutosizeTextarea
            id="imageDescription"
            placeholder="补充图像风格，例如：电影级画质，黄金时间光照，超高清..."
            value={imageDescription}
            onChange={(e) => setImageDescription(e.target.value)}
            minHeight={80}
            maxHeight={200}
          />
        </div>

        {/* 参考图片上传 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>参考图片（可选）</Label>
            {segment.referenceImage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveReference}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-3 w-3 mr-1" />
                移除
              </Button>
            )}
          </div>

          <Card className="aspect-video bg-secondary/30 rounded-lg overflow-hidden border-2 border-dashed border-border">
            {segment.referenceImage ? (
              <div className="relative w-full h-full group">
                <img
                  src={segment.referenceImage}
                  alt="参考图片（可选）"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleUploadClick}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    更换图片
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={handleUploadClick}
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">上传参考图片</p>
                  <p className="text-xs opacity-70">
                    支持 JPG、PNG 格式，最大 5MB
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <p className="text-xs text-muted-foreground">
            上传参考图片可以帮助AI更好地理解您想要的画面效果
          </p>
        </div>

        <Separator />

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
          生成视频帧
        </Button>

        <Separator />

        {/* 图像预览区域 */}
        <div className="space-y-4">
          <h4 className="font-medium">生成的图像</h4>

          {/* 首帧 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>首帧</Label>
              {segment.startFrame && (
                <Popover
                  open={openPopover === 'start'}
                  onOpenChange={(open) => !open && setOpenPopover(null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRegenerateClick('start', 'start')}
                      disabled={segment.status === 'generating'}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      重新生成
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" side="bottom" align="end">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">重新生成首帧</h4>
                        <p className="text-xs text-muted-foreground">
                          请描述当前图像不符合预期的地方
                        </p>
                      </div>
                      <AutosizeTextarea
                        placeholder="例如：人物表情不够自然，背景色彩过于鲜艳..."
                        value={regenerateFeedback}
                        onChange={(e) => setRegenerateFeedback(e.target.value)}
                        className="text-sm"
                        minHeight={80}
                        maxHeight={200}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOpenPopover(null)}
                        >
                          取消
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleRegenerateConfirm}
                          disabled={!regenerateFeedback.trim()}
                        >
                          确认
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
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
                <Popover
                  open={openPopover === 'end'}
                  onOpenChange={(open) => !open && setOpenPopover(null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRegenerateClick('end', 'end')}
                      disabled={segment.status === 'generating'}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      重新生成
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" side="bottom" align="end">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">重新生成尾帧</h4>
                        <p className="text-xs text-muted-foreground">
                          请描述当前图像不符合预期的地方
                        </p>
                      </div>
                      <AutosizeTextarea
                        placeholder="例如：人物表情不够自然，背景色彩过于鲜艳..."
                        value={regenerateFeedback}
                        onChange={(e) => setRegenerateFeedback(e.target.value)}
                        className="text-sm"
                        minHeight={80}
                        maxHeight={200}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOpenPopover(null)}
                        >
                          取消
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleRegenerateConfirm}
                          disabled={!regenerateFeedback.trim()}
                        >
                          确认
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
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
