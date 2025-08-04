import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Trash2, Edit3, Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  createdAt: Date;
  thumbnail: string;
  segmentCount: number;
  duration: number;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: '我的第一个视频',
      createdAt: new Date(2024, 0, 15),
      thumbnail: 'https://picsum.photos/400/225?random=1',
      segmentCount: 3,
      duration: 15
    },
    {
      id: '2',
      name: '产品演示视频',
      createdAt: new Date(2024, 0, 12),
      thumbnail: 'https://picsum.photos/400/225?random=2',
      segmentCount: 5,
      duration: 30
    },
    {
      id: '3',
      name: '创意短片',
      createdAt: new Date(2024, 0, 8),
      thumbnail: 'https://picsum.photos/400/225?random=3',
      segmentCount: 7,
      duration: 45
    }
  ]);

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    toast.success("项目已删除");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 顶部导航栏 */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
            </Link>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Play className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold">项目管理</h1>
          </div>
          
          <Link to="/">
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              新建项目
            </Button>
          </Link>
        </div>
      </header>

      {/* 项目列表 */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">我的项目</h2>
          <p className="text-muted-foreground">
            共 {projects.length} 个项目
          </p>
        </div>

        {projects.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 backdrop-blur">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">还没有项目</h3>
            <p className="text-muted-foreground mb-4">
              创建您的第一个视频项目开始创作吧
            </p>
            <Link to="/">
              <Button variant="default">
                <Plus className="h-4 w-4 mr-2" />
                新建项目
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300 group">
                {/* 缩略图 */}
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={project.thumbnail}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Play className="h-6 w-6 text-white ml-1" />
                    </div>
                  </div>
                </div>

                {/* 项目信息 */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 truncate">
                    {project.name}
                  </h3>
                  
                  <div className="space-y-1 text-sm text-muted-foreground mb-4">
                    <p>创建于 {formatDate(project.createdAt)}</p>
                    <p>{project.segmentCount} 个片段 • {formatDuration(project.duration)}</p>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Link to="/" className="flex-1">
                      <Button variant="default" size="sm" className="w-full">
                        <Edit3 className="h-3 w-3 mr-2" />
                        编辑
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;