# Timeline Craft AI - 开发指南

## 1. 开发环境搭建

### 1.1 系统要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git
- 现代浏览器 (Chrome 90+, Firefox 88+, Safari 14+)

### 1.2 项目克隆和安装
```bash
# 克隆项目
git clone <YOUR_GIT_URL>
cd timeline-craft-ai

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 预览生产构建
pnpm run preview
```

### 1.3 开发工具配置

#### 1.3.1 VS Code 推荐插件
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens",
    "ms-vscode.vscode-json"
  ]
}
```

#### 1.3.2 Editor Config
```editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

## 2. 代码规范

### 2.1 TypeScript 规范

#### 2.1.1 类型定义
```typescript
// ✅ 推荐：使用 interface 定义对象类型
interface Segment {
  id: string;
  startTime: number;
  endTime: number;
  description: string;
  status: 'empty' | 'generating' | 'ready' | 'error';
}

// ✅ 推荐：使用 type 定义联合类型
type SegmentStatus = 'empty' | 'generating' | 'ready' | 'error';

// ✅ 推荐：使用泛型增强复用性
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
```

#### 2.1.2 组件类型定义
```typescript
// Props 接口命名：组件名 + Props
interface TimelineEditorProps {
  segments: Segment[];
  selectedSegment: Segment | null;
  onCreateSegment: (duration: number) => void;
  onSelectSegment: (segment: Segment | null) => void;
}

// 组件定义
export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  segments,
  selectedSegment,
  onCreateSegment,
  onSelectSegment,
}) => {
  // 组件实现
};
```

### 2.2 React 组件规范

#### 2.2.1 函数组件结构
```typescript
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  // props 定义
}

export const Component: React.FC<ComponentProps> = ({
  // props 解构
}) => {
  // 1. hooks 调用
  const [state, setState] = useState();
  
  // 2. 计算值
  const computedValue = useMemo(() => {
    // 计算逻辑
  }, [dependencies]);
  
  // 3. 事件处理函数
  const handleClick = useCallback(() => {
    // 事件处理逻辑
  }, [dependencies]);
  
  // 4. 副作用
  useEffect(() => {
    // 副作用逻辑
  }, [dependencies]);
  
  // 5. 渲染
  return (
    <div className={cn("base-styles", className)}>
      {/* JSX */}
    </div>
  );
};
```

#### 2.2.2 Hooks 使用规范
```typescript
// ✅ 推荐：自定义 Hook
const useTimeline = (initialSegments: Segment[]) => {
  const [segments, setSegments] = useState(initialSegments);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  
  const createSegment = useCallback((duration: number) => {
    // 创建片段逻辑
  }, [segments]);
  
  return {
    segments,
    selectedSegment,
    createSegment,
    setSelectedSegment,
  };
};

// ✅ 推荐：useCallback 用于事件处理函数
const handleSegmentCreate = useCallback((duration: number) => {
  onCreateSegment(duration);
}, [onCreateSegment]);

// ✅ 推荐：useMemo 用于计算值
const totalDuration = useMemo(() => {
  return segments.reduce((sum, segment) => sum + (segment.endTime - segment.startTime), 0);
}, [segments]);
```

### 2.3 样式规范

#### 2.3.1 Tailwind CSS 使用规范
```typescript
// ✅ 推荐：使用 cn() 工具函数
<div className={cn(
  "base-styles",
  "responsive-styles sm:flex",
  "state-styles hover:bg-primary",
  conditionalStyles && "conditional-styles",
  className
)}>

// ✅ 推荐：使用设计系统 tokens
<div className="bg-background text-foreground border-border">

// ❌ 避免：直接使用颜色值
<div className="bg-white text-black border-gray-200">
```

#### 2.3.2 组件变体定义
```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends 
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {}
```

## 3. 项目结构详解

### 3.1 组件组织原则

#### 3.1.1 目录结构
```
src/components/
├── ui/                  # 通用UI组件
│   ├── button.tsx      # 基础按钮组件
│   ├── card.tsx        # 卡片组件
│   └── ...
├── studio/             # 工作室业务组件
│   ├── TimelineEditor.tsx
│   ├── VideoPlayer.tsx
│   └── SegmentEditPanel.tsx
└── common/             # 公共业务组件
    ├── Header.tsx
    ├── Footer.tsx
    └── ...
```

#### 3.1.2 组件命名规范
- **PascalCase**: 组件文件和组件名
- **camelCase**: 函数、变量、props
- **SCREAMING_SNAKE_CASE**: 常量
- **kebab-case**: CSS类名、文件夹

#### 3.1.3 导出规范
```typescript
// ✅ 推荐：命名导出
export const TimelineEditor = () => {};
export const VideoPlayer = () => {};

// ✅ 推荐：类型和组件一起导出
export interface SegmentProps {}
export const Segment = () => {};

// ✅ 推荐：索引文件重新导出
// components/studio/index.ts
export { TimelineEditor } from './TimelineEditor';
export { VideoPlayer } from './VideoPlayer';
export { SegmentEditPanel } from './SegmentEditPanel';
```

### 3.2 状态管理策略

#### 3.2.1 本地状态
```typescript
// ✅ 推荐：简单状态使用 useState
const [isOpen, setIsOpen] = useState(false);

// ✅ 推荐：复杂状态使用 useReducer
const segmentReducer = (state: SegmentState, action: SegmentAction) => {
  switch (action.type) {
    case 'CREATE_SEGMENT':
      return { ...state, segments: [...state.segments, action.payload] };
    case 'UPDATE_SEGMENT':
      return {
        ...state,
        segments: state.segments.map(segment =>
          segment.id === action.payload.id
            ? { ...segment, ...action.payload.updates }
            : segment
        ),
      };
    default:
      return state;
  }
};
```

#### 3.2.2 状态提升原则
```typescript
// ✅ 推荐：状态提升到最近公共父组件
const StudioPage = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  
  return (
    <div>
      <TimelineEditor 
        segments={segments}
        selectedSegment={selectedSegment}
        onSelectSegment={setSelectedSegment}
      />
      <SegmentEditPanel 
        segment={selectedSegment}
        onUpdateSegment={updateSegment}
      />
    </div>
  );
};
```

## 4. 开发工作流

### 4.1 分支管理
```bash
# 功能开发分支
git checkout -b feature/timeline-zoom-control
git checkout -b feature/ai-image-generation

# 修复分支
git checkout -b fix/segment-overlap-issue
git checkout -b fix/mobile-responsive-layout

# 文档分支
git checkout -b docs/api-documentation
git checkout -b docs/user-guide
```

### 4.2 提交规范
```bash
# 功能提交
git commit -m "feat: add timeline zoom control"
git commit -m "feat: implement AI image generation"

# 修复提交
git commit -m "fix: resolve segment overlap issue"
git commit -m "fix: improve mobile responsive layout"

# 文档提交
git commit -m "docs: add API documentation"
git commit -m "docs: update development guide"

# 样式提交
git commit -m "style: improve timeline component styling"

# 重构提交
git commit -m "refactor: extract timeline utilities"
```

### 4.3 代码审查检查列表

#### 4.3.1 功能检查
- [ ] 功能是否按需求实现
- [ ] 是否有边界情况处理
- [ ] 错误处理是否完善
- [ ] 性能是否符合要求

#### 4.3.2 代码质量检查
- [ ] 代码是否遵循项目规范
- [ ] 类型定义是否完整
- [ ] 组件是否可复用
- [ ] 是否有适当的注释

#### 4.3.3 测试检查
- [ ] 是否有相应的单元测试
- [ ] 测试覆盖率是否足够
- [ ] 是否通过所有测试

## 5. 调试和故障排除

### 5.1 常见问题解决

#### 5.1.1 时间轴渲染问题
```typescript
// 问题：时间轴宽度计算错误
// 解决：检查容器宽度获取时机
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
```

#### 5.1.2 状态更新问题
```typescript
// 问题：状态更新不触发重渲染
// 解决：确保状态不可变更新
setSegments(prevSegments => 
  prevSegments.map(segment =>
    segment.id === id 
      ? { ...segment, ...updates }  // 创建新对象
      : segment
  )
);
```

### 5.2 性能调试

#### 5.2.1 React DevTools
```typescript
// 使用 React.memo 优化组件
export const SegmentItem = React.memo<SegmentItemProps>(({ segment, onSelect }) => {
  return (
    <div onClick={() => onSelect(segment)}>
      {segment.description}
    </div>
  );
});

// 使用 useCallback 优化函数
const handleSegmentSelect = useCallback((segment: Segment) => {
  onSelectSegment(segment);
}, [onSelectSegment]);
```

#### 5.2.2 性能监控
```typescript
// 性能测量
const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name}: ${end - start}ms`);
};

// 使用示例
measurePerformance('Timeline Render', () => {
  renderTimeline();
});
```

## 6. 最佳实践

### 6.1 组件设计
- 单一职责原则
- 组件最小化
- Props接口清晰
- 合理的默认值

### 6.2 性能优化
- 避免在render中创建对象/函数
- 使用React.memo优化纯组件
- 合理使用useCallback和useMemo
- 实施代码分割

### 6.3 可维护性
- 清晰的命名规范
- 适度的注释
- 模块化设计
- 文档同步更新

---

**文档版本**: v1.0  
**最后更新**: 2025-01-06  
**维护者**: Timeline Craft AI 开发团队