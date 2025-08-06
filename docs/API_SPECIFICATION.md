# Timeline Craft AI - API 规格说明

## 1. API 概述

### 1.1 API 架构
Timeline Craft AI 采用 RESTful API 设计，结合 Supabase 提供的后端服务，实现数据持久化、用户认证和AI集成。

### 1.2 基础信息
- **Base URL**: `https://your-supabase-url.supabase.co`
- **API Version**: v1
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)

### 1.3 错误响应格式
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "validation error details"
    }
  },
  "timestamp": "2025-01-06T12:00:00Z",
  "path": "/api/v1/projects"
}
```

## 2. 认证 API

### 2.1 用户注册
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**响应**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2025-01-06T12:00:00Z"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}
```

### 2.2 用户登录
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### 2.3 刷新令牌
```http
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{
  "refresh_token": "refresh_token"
}
```

### 2.4 用户登出
```http
POST /auth/v1/logout
Authorization: Bearer <access_token>
```

## 3. 项目管理 API

### 3.1 获取项目列表
```http
GET /rest/v1/projects
Authorization: Bearer <access_token>
```

**查询参数**:
- `limit`: 限制返回数量 (默认: 10)
- `offset`: 偏移量 (默认: 0)
- `order`: 排序字段.排序方向 (例: created_at.desc)

**响应**:
```json
[
  {
    "id": "uuid",
    "name": "我的第一个视频",
    "description": "项目描述",
    "thumbnail": "https://storage.url/thumb.jpg",
    "duration": 180,
    "created_at": "2025-01-06T12:00:00Z",
    "updated_at": "2025-01-06T12:00:00Z",
    "user_id": "uuid",
    "metadata": {
      "total_segments": 5,
      "generated_segments": 3,
      "video_url": "https://storage.url/video.mp4"
    }
  }
]
```

### 3.2 创建项目
```http
POST /rest/v1/projects
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "新项目名称",
  "description": "项目描述",
  "duration": 180
}
```

### 3.3 获取单个项目
```http
GET /rest/v1/projects?id=eq.<project_id>&select=*,segments(*)
Authorization: Bearer <access_token>
```

**响应**:
```json
{
  "id": "uuid",
  "name": "项目名称",
  "description": "项目描述",
  "thumbnail": "https://storage.url/thumb.jpg",
  "duration": 180,
  "created_at": "2025-01-06T12:00:00Z",
  "updated_at": "2025-01-06T12:00:00Z",
  "user_id": "uuid",
  "segments": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "start_time": 0,
      "end_time": 30,
      "description": "片段描述",
      "status": "ready",
      "start_frame": "https://storage.url/start.jpg",
      "end_frame": "https://storage.url/end.jpg",
      "video_url": "https://storage.url/segment.mp4"
    }
  ]
}
```

### 3.4 更新项目
```http
PATCH /rest/v1/projects?id=eq.<project_id>
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "更新的项目名称",
  "description": "更新的描述"
}
```

### 3.5 删除项目
```http
DELETE /rest/v1/projects?id=eq.<project_id>
Authorization: Bearer <access_token>
```

## 4. 片段管理 API

### 4.1 创建片段
```http
POST /rest/v1/segments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "project_id": "uuid",
  "start_time": 0,
  "end_time": 30,
  "description": "一只可爱的小猫在花园里玩耍，背景是美丽的春日阳光"
}
```

### 4.2 更新片段
```http
PATCH /rest/v1/segments?id=eq.<segment_id>
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "description": "更新的片段描述",
  "status": "generating"
}
```

### 4.3 删除片段
```http
DELETE /rest/v1/segments?id=eq.<segment_id>
Authorization: Bearer <access_token>
```

### 4.4 获取项目片段
```http
GET /rest/v1/segments?project_id=eq.<project_id>&order=start_time.asc
Authorization: Bearer <access_token>
```

## 5. AI 生成 API

### 5.1 生成片段图像
```http
POST /functions/v1/generate-segment-images
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "segment_id": "uuid",
  "description": "一只可爱的小猫在花园里玩耍，背景是美丽的春日阳光",
  "style": "realistic",
  "aspect_ratio": "16:9"
}
```

**响应**:
```json
{
  "segment_id": "uuid",
  "start_frame": {
    "url": "https://storage.url/start_frame.jpg",
    "generation_id": "uuid"
  },
  "end_frame": {
    "url": "https://storage.url/end_frame.jpg",
    "generation_id": "uuid"
  },
  "status": "completed"
}
```

### 5.2 重新生成图像
```http
POST /functions/v1/regenerate-image
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "segment_id": "uuid",
  "frame_type": "start_frame",
  "description": "更新的描述"
}
```

### 5.3 生成视频片段
```http
POST /functions/v1/generate-segment-video
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "segment_id": "uuid",
  "start_frame_url": "https://storage.url/start.jpg",
  "end_frame_url": "https://storage.url/end.jpg",
  "duration": 30,
  "motion_prompt": "平滑的摄像机移动"
}
```

### 5.4 合成完整视频
```http
POST /functions/v1/compose-video
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "project_id": "uuid",
  "segments": [
    {
      "segment_id": "uuid",
      "video_url": "https://storage.url/segment1.mp4"
    },
    {
      "segment_id": "uuid",
      "video_url": "https://storage.url/segment2.mp4"
    }
  ],
  "transitions": {
    "type": "fade",
    "duration": 1
  }
}
```

### 5.5 获取生成状态
```http
GET /functions/v1/generation-status/<generation_id>
Authorization: Bearer <access_token>
```

**响应**:
```json
{
  "generation_id": "uuid",
  "status": "processing",
  "progress": 65,
  "estimated_completion": "2025-01-06T12:05:00Z",
  "error": null
}
```

## 6. 文件存储 API

### 6.1 上传文件
```http
POST /storage/v1/object/images/<file_name>
Authorization: Bearer <access_token>
Content-Type: image/jpeg

[Binary file data]
```

### 6.2 获取文件URL
```http
GET /storage/v1/object/public/images/<file_name>
```

### 6.3 删除文件
```http
DELETE /storage/v1/object/images/<file_name>
Authorization: Bearer <access_token>
```

## 7. 实时订阅 API

### 7.1 WebSocket 连接
```javascript
const supabase = createClient(url, key);

// 订阅项目变更
const subscription = supabase
  .channel('project_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'projects',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Project changed:', payload);
  })
  .subscribe();
```

### 7.2 片段生成状态实时更新
```javascript
// 订阅片段状态变更
const segmentSubscription = supabase
  .channel('segment_status')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'segments',
    filter: `project_id=eq.${projectId}`
  }, (payload) => {
    updateSegmentStatus(payload.new);
  })
  .subscribe();
```

## 8. 错误处理

### 8.1 错误代码
| 代码 | 描述 | HTTP状态码 |
|------|------|------------|
| `INVALID_CREDENTIALS` | 无效的登录凭据 | 401 |
| `ACCESS_DENIED` | 访问被拒绝 | 403 |
| `RESOURCE_NOT_FOUND` | 资源未找到 | 404 |
| `VALIDATION_ERROR` | 请求数据验证失败 | 400 |
| `RATE_LIMIT_EXCEEDED` | 请求频率超限 | 429 |
| `AI_SERVICE_ERROR` | AI服务错误 | 502 |
| `STORAGE_ERROR` | 存储服务错误 | 503 |

### 8.2 重试策略
```javascript
const apiCall = async (url, options, retries = 3) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  } catch (error) {
    if (retries > 0 && isRetriableError(error)) {
      await delay(1000);
      return apiCall(url, options, retries - 1);
    }
    throw error;
  }
};
```

## 9. 速率限制

### 9.1 限制规则
| 端点类型 | 限制 | 时间窗口 |
|----------|------|----------|
| 认证端点 | 10 requests | 1 minute |
| 数据端点 | 100 requests | 1 minute |
| AI生成端点 | 20 requests | 1 hour |
| 文件上传 | 50 requests | 1 hour |

### 9.2 响应头
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

## 10. SDK 使用示例

### 10.1 JavaScript SDK
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// 项目管理
class ProjectAPI {
  async createProject(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async updateProject(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*, segments(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}

// AI 生成
class AIGenerationAPI {
  async generateSegmentImages(segmentId, description) {
    const { data, error } = await supabase.functions.invoke(
      'generate-segment-images',
      {
        body: { segment_id: segmentId, description }
      }
    );
    
    if (error) throw error;
    return data;
  }
}
```

---

**文档版本**: v1.0  
**最后更新**: 2025-01-06  
**维护者**: Timeline Craft AI 开发团队