import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderOpen, FileText, Video, Plus, Youtube, PlayCircle } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const AdminContent = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    description: "",
    video_url: "",
    video_provider: "youtube" as "youtube" | "vimeo",
    duration_minutes: "",
  });

  // Fetch courses for dropdown
  const { data: courses } = useQuery({
    queryKey: ["admin-courses-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");

      if (error) throw error;
      return data;
    },
  });

  // Fetch course contents
  const { data: contents, refetch: refetchContents } = useQuery({
    queryKey: ["admin-course-contents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_contents")
        .select(`
          *,
          courses(title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const detectVideoProvider = (url: string): "youtube" | "vimeo" | null => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "youtube";
    } else if (url.includes("vimeo.com")) {
      return "vimeo";
    }
    return null;
  };

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, video_url: url });
    const provider = detectVideoProvider(url);
    if (provider) {
      setFormData((prev) => ({ ...prev, video_url: url, video_provider: provider }));
    }
  };

  const handleCreateContent = async () => {
    try {
      if (!formData.course_id || !formData.title || !formData.video_url) {
        toast({
          title: "입력 오류",
          description: "필수 항목을 모두 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("course_contents").insert([
        {
          course_id: formData.course_id,
          title: formData.title,
          description: formData.description,
          video_url: formData.video_url,
          video_provider: formData.video_provider,
          duration_minutes: parseInt(formData.duration_minutes) || 0,
          content_type: "video",
          is_published: true,
        },
      ]);

      if (error) throw error;

      toast({
        title: "콘텐츠 생성 완료",
        description: "새 비디오 콘텐츠가 생성되었습니다.",
      });

      setIsDialogOpen(false);
      setFormData({
        course_id: "",
        title: "",
        description: "",
        video_url: "",
        video_provider: "youtube",
        duration_minutes: "",
      });
      refetchContents();
    } catch (error: any) {
      toast({
        title: "콘텐츠 생성 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getProviderBadge = (provider: string) => {
    const variants: Record<string, { icon: any; label: string; color: string }> = {
      youtube: { icon: Youtube, label: "YouTube", color: "text-red-500" },
      vimeo: { icon: PlayCircle, label: "Vimeo", color: "text-blue-500" },
    };
    const config = variants[provider] || variants.youtube;
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-logo font-bold tracking-tight">콘텐츠 관리</h1>
            <p className="text-muted-foreground mt-2">
              비디오 강의 콘텐츠를 등록하고 관리합니다
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                비디오 콘텐츠 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>새 비디오 콘텐츠 추가</DialogTitle>
                <DialogDescription>
                  YouTube 또는 Vimeo 링크를 입력하여 강의 콘텐츠를 추가하세요
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course_id">강좌 선택</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, course_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="강좌를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">콘텐츠 제목</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="예: React Hooks 기초"
                  />
                </div>

                <div>
                  <Label htmlFor="video_url">비디오 URL</Label>
                  <Input
                    id="video_url"
                    value={formData.video_url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="YouTube 또는 Vimeo 링크를 입력하세요"
                  />
                  {formData.video_provider && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">감지된 플랫폼:</span>
                      {getProviderBadge(formData.video_provider)}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="duration_minutes">영상 길이 (분)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_minutes: e.target.value })
                    }
                    placeholder="예: 45"
                  />
                </div>

                <div>
                  <Label htmlFor="description">설명 (선택사항)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="강의 내용에 대한 설명을 입력하세요"
                    rows={3}
                  />
                </div>

                <Button onClick={handleCreateContent} className="w-full">
                  콘텐츠 추가
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 콘텐츠 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>비디오 콘텐츠 목록</CardTitle>
            <CardDescription>
              등록된 모든 비디오 강의 콘텐츠를 확인합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>강좌</TableHead>
                  <TableHead>플랫폼</TableHead>
                  <TableHead>길이</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>등록일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contents?.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium">{content.title}</TableCell>
                    <TableCell>{(content.courses as any)?.title || "-"}</TableCell>
                    <TableCell>
                      {content.video_provider &&
                        getProviderBadge(content.video_provider)}
                    </TableCell>
                    <TableCell>{content.duration_minutes}분</TableCell>
                    <TableCell>
                      <Badge variant={content.is_published ? "default" : "secondary"}>
                        {content.is_published ? "게시됨" : "비공개"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(content.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                  </TableRow>
                ))}
                {!contents?.length && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      등록된 콘텐츠가 없습니다
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminContent;
