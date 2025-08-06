# Timeline Craft AI - 技术架构文档

## 1. 整体架构

### 1.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端应用                               │
├─────────────────────────────────────────────────────────────┤
│  React Components                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   页面组件   │ │   业务组件   │ │   UI组件    │           │
│  │             │ │             │ │             │           │
│  │ Projects    │ │ Timeline    │ │ shadcn/ui   │           │
│  │ Studio      │ │ VideoPlayer │ │ components  │           │
│  │ NotFound    │ │ SegmentEdit │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  状态管理 & 工具                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ React State │ │   Utils     │ │   Hooks     │           │
│  │             │ │             │ │             │           │
│  │ useState    │ │ cn()        │ │ use-mobile  │           │
│  │ useEffect   │ │ formatTime  │ │ use-toast   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      后端服务 (计划)                          │
├─────────────────────────────────────────────────────────────┤
│  Supabase 服务                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   数据库     │ │    认证     │ │   存储      │           │
│  │             │ │             │ │             │           │
│  │ PostgreSQL  │ │ Auth.js     │ │ File        │           │
│  │ Projects    │ │ Users       │ │ Storage     │           │
│  │ Segments    │ │ Sessions    │ │ Images      │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  外部API集成                                                │
│  ┌─────────────┐ ┌─────────────┐                           │
│  │  AI图像生成  │ │  AI视频生成  │                           │
│  │             │ │             │                           │
│  │ Text-to-    │ │ Video       │                           │
│  │ Image API   │ │ Generation  │                           │
│  └─────────────┘ └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## 2. 前端架构

### 2.1 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^18.0.0 | 前端框架 |
| TypeScript | ^5.0.0 | 类型系统 |
| Vite | ^5.0.0 | 构建工具 |
| Tailwind CSS | ^3.0.0 | 样式框架 |
| shadcn/ui | Latest | UI组件库 |
| Lucide React | Latest | 图标库 |

### 2.2 目录结构

```
src/
├── components/           # 组件目录
│   ├── studio/          # 工作室相关组件
│   │   ├── TimelineEditor.tsx
│   │   ├── VideoPlayer.tsx
│   │   └── SegmentEditPanel.tsx
│   └── ui/              # 通用UI组件
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── hooks/               # 自定义Hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                 # 工具库
│   └── utils.ts
├── pages/               # 页面组件
│   ├── Projects.tsx
│   ├── Studio.tsx
│   └── NotFound.tsx
├── App.tsx              # 应用根组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

### 2.3 组件设计原则

#### 2.3.1 组件分层
- **页面组件**: 负责路由和整体布局
- **业务组件**: 负责具体业务逻辑
- **UI组件**: 负责纯展示和基础交互

#### 2.3.2 数据流
- Props向下传递数据
- 回调函数向上传递事件
- 状态提升到最近公共父组件

#### 2.3.3 样式管理
- 使用Tailwind CSS原子化样式
- 通过design tokens保持一致性
- shadcn/ui提供基础组件变体

## 3. 核心模块设计

### 3.1 时间轴编辑器 (TimelineEditor)

#### 3.1.1 职责
- 可视化时间轴展示
- 片段创建和管理
- 缩放和滚动控制
- 用户交互处理

#### 3.1.2 核心算法
```typescript
// 时间轴位置计算
const getPixelsPerSecond = () => {
  const minWidth = containerWidth * 0.8;
  const calculatedPixelsPerSecond = minWidth / TIMELINE_DURATION;
  return Math.max(calculatedPixelsPerSecond, BASE_PIXELS_PER_SECOND * 0.5);
};

// 时间转换为像素位置
const getPositionFromTime = (time: number) => {
  return time * getPixelsPerSecond() * zoom;
};

// 像素位置转换为时间
const getTimeFromPosition = (x: number) => {
  const rect = timelineRef.current.getBoundingClientRect();
  const relativeX = x - rect.left;
  return Math.max(0, Math.min(TIMELINE_DURATION, relativeX / (getPixelsPerSecond() * zoom)));
};
```

#### 3.1.3 状态管理
```typescript
interface TimelineState {
  segments: Segment[];
  selectedSegment: Segment | null;
  zoom: number;
  isDragging: boolean;
  dragStart: number | null;
  dragEnd: number | null;
}
```

### 3.2 片段编辑面板 (SegmentEditPanel)

#### 3.2.1 职责
- 片段属性编辑
- 描述指导展示
- AI生成状态管理
- 用户输入验证

#### 3.2.2 描述结构化
```typescript
interface DescriptionGuide {
  subject: string;    // 主体
  motion: string;     // 运动
  background: string; // 背景
}
```

### 3.3 视频播放器 (VideoPlayer)

#### 3.3.1 职责
- 视频文件播放
- 播放控制
- 进度展示
- 全屏支持

#### 3.3.2 播放状态
```typescript
interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isFullscreen: boolean;
}
```

## 4. 数据模型

### 4.1 核心实体

#### 4.1.1 项目 (Project)
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  segments: Segment[];
  metadata?: {
    totalSegments: number;
    generatedSegments: number;
    videoUrl?: string;
  };
}
```

#### 4.1.2 片段 (Segment)
```typescript
interface Segment {
  id: string;
  projectId: string;
  startTime: number;
  endTime: number;
  description: string;
  status: 'empty' | 'generating' | 'ready' | 'error';
  startFrame?: string;
  endFrame?: string;
  videoUrl?: string;
  metadata?: {
    aiModel?: string;
    generationTime?: number;
    retryCount?: number;
  };
}
```

### 4.2 状态类型定义

#### 4.2.1 生成状态
```typescript
type GenerationStatus = 'empty' | 'generating' | 'ready' | 'error';

interface GenerationProgress {
  status: GenerationStatus;
  progress?: number; // 0-100
  message?: string;
  error?: string;
}
```

## 5. 性能优化策略

### 5.1 渲染优化
- 使用 `React.memo` 优化组件重渲染
- 使用 `useCallback` 和 `useMemo` 优化计算
- 虚拟化长时间轴渲染

### 5.2 状态管理优化
- 状态提升到最小必要范围
- 避免过度嵌套的状态结构
- 考虑引入状态管理库（Zustand/Redux）

### 5.3 资源加载优化
- 图像懒加载
- 代码分割和动态导入
- 缓存策略实施

## 6. 测试策略

### 6.1 单元测试
- 组件功能测试
- 工具函数测试
- Hook测试

### 6.2 集成测试
- 用户交互流程测试
- 组件间通信测试
- API集成测试

### 6.3 E2E测试
- 完整用户旅程测试
- 跨浏览器兼容性测试
- 性能基准测试

## 7. 部署和CI/CD

### 7.1 构建流程
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm run build
      - uses: peaceiris/actions-gh-pages@v3
```

### 7.2 环境配置
- 开发环境：Vite dev server
- 预发布环境：GitHub Pages
- 生产环境：自定义域名

## 8. 安全考虑

### 8.1 前端安全
- XSS防护
- CSRF保护
- 内容安全策略 (CSP)

### 8.2 数据安全
- 敏感数据加密
- API密钥管理
- 用户数据隐私保护

---

**文档版本**: v1.0  
**最后更新**: 2025-01-06  
**维护者**: Timeline Craft AI 开发团队