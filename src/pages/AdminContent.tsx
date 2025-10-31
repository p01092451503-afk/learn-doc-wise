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
import { FolderOpen, FileText, Video, Plus, Youtube, PlayCircle, Tag, Folder, Pencil } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const AdminContent = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    description: "",
    video_url: "",
    video_provider: "youtube" as "youtube" | "vimeo",
    duration_minutes: "",
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });

  const [tagFormData, setTagFormData] = useState({
    name: "",
    slug: "",
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

  // Fetch categories
  const { data: categories, refetch: refetchCategories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");

      if (error) throw error;
      return data;
    },
  });

  // Fetch tags
  const { data: tags, refetch: refetchTags } = useQuery({
    queryKey: ["admin-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");

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

  const handleEditContent = (content: any) => {
    setEditingContent(content);
    setFormData({
      course_id: content.course_id,
      title: content.title,
      description: content.description || "",
      video_url: content.video_url,
      video_provider: content.video_provider,
      duration_minutes: content.duration_minutes.toString(),
    });
    setIsDialogOpen(true);
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

      if (editingContent) {
        // Update existing content
        const { error } = await supabase
          .from("course_contents")
          .update({
            course_id: formData.course_id,
            title: formData.title,
            description: formData.description,
            video_url: formData.video_url,
            video_provider: formData.video_provider,
            duration_minutes: parseInt(formData.duration_minutes) || 0,
          })
          .eq("id", editingContent.id);

        if (error) throw error;

        toast({
          title: "콘텐츠 수정 완료",
          description: "비디오 콘텐츠가 수정되었습니다.",
        });
      } else {
        // Create new content
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
      }

      setIsDialogOpen(false);
      setEditingContent(null);
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
        title: editingContent ? "콘텐츠 수정 실패" : "콘텐츠 생성 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      slug: category.slug,
    });
    setCategoryDialogOpen(true);
  };

  const handleCreateCategory = async () => {
    try {
      if (!categoryFormData.name) {
        toast({
          title: "입력 오류",
          description: "카테고리 이름을 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update({
            name: categoryFormData.name,
            description: categoryFormData.description,
            slug: categoryFormData.slug || categoryFormData.name.toLowerCase().replace(/\s+/g, "-"),
          })
          .eq("id", editingCategory.id);

        if (error) throw error;

        toast({
          title: "카테고리 수정 완료",
          description: "카테고리가 수정되었습니다.",
        });
      } else {
        // Create new category
        const { error } = await supabase.from("categories").insert([
          {
            name: categoryFormData.name,
            description: categoryFormData.description,
            slug: categoryFormData.slug || categoryFormData.name.toLowerCase().replace(/\s+/g, "-"),
          },
        ]);

        if (error) throw error;

        toast({
          title: "카테고리 생성 완료",
          description: "새 카테고리가 생성되었습니다.",
        });
      }

      setCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryFormData({ name: "", description: "", slug: "" });
      refetchCategories();
    } catch (error: any) {
      toast({
        title: editingCategory ? "카테고리 수정 실패" : "카테고리 생성 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateTag = async () => {
    try {
      if (!tagFormData.name) {
        toast({
          title: "입력 오류",
          description: "태그 이름을 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("tags").insert([
        {
          name: tagFormData.name,
          slug: tagFormData.slug || tagFormData.name.toLowerCase().replace(/\s+/g, "-"),
        },
      ]);

      if (error) throw error;

      toast({
        title: "태그 생성 완료",
        description: "새 태그가 생성되었습니다.",
      });

      setTagDialogOpen(false);
      setTagFormData({ name: "", slug: "" });
      refetchTags();
    } catch (error: any) {
      toast({
        title: "태그 생성 실패",
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
        <div>
          <h1 className="text-4xl font-logo font-bold tracking-tight">콘텐츠 관리</h1>
          <p className="text-muted-foreground mt-2">
            카테고리, 태그 및 비디오 강의 콘텐츠를 등록하고 관리합니다
          </p>
        </div>

        <Tabs 
          defaultValue="categories" 
          className="space-y-6"
          onValueChange={(value) => {
            // Refetch data when switching tabs to ensure fresh data
            if (value === "contents") {
              refetchContents();
            } else if (value === "categories") {
              refetchCategories();
            } else if (value === "tags") {
              refetchTags();
            }
          }}
        >
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="categories" className="text-base">
              <Folder className="h-5 w-5 mr-2" />
              카테고리
            </TabsTrigger>
            <TabsTrigger value="contents" className="text-base font-semibold">
              <Video className="h-5 w-5 mr-2" />
              강좌 콘텐츠
            </TabsTrigger>
            <TabsTrigger value="tags" className="text-base">
              <Tag className="h-5 w-5 mr-2" />
              태그
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>카테고리 관리</CardTitle>
                    <CardDescription>강좌 카테고리를 생성하고 관리합니다</CardDescription>
                  </div>
                  <Dialog open={categoryDialogOpen} onOpenChange={(open) => {
                    setCategoryDialogOpen(open);
                    if (!open) {
                      setEditingCategory(null);
                      setCategoryFormData({ name: "", description: "", slug: "" });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        카테고리 추가
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingCategory ? "카테고리 수정" : "새 카테고리 생성"}</DialogTitle>
                        <DialogDescription>
                          {editingCategory ? "카테고리 정보를 수정합니다" : "새로운 카테고리를 생성합니다"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cat_name">이름</Label>
                          <Input
                            id="cat_name"
                            value={categoryFormData.name}
                            onChange={(e) =>
                              setCategoryFormData({ ...categoryFormData, name: e.target.value })
                            }
                            placeholder="카테고리 이름"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cat_description">설명</Label>
                          <Textarea
                            id="cat_description"
                            value={categoryFormData.description}
                            onChange={(e) =>
                              setCategoryFormData({
                                ...categoryFormData,
                                description: e.target.value,
                              })
                            }
                            placeholder="카테고리 설명"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cat_slug">URL 식별자 (선택사항)</Label>
                          <Input
                            id="cat_slug"
                            value={categoryFormData.slug}
                            onChange={(e) =>
                              setCategoryFormData({ ...categoryFormData, slug: e.target.value })
                            }
                            placeholder="자동 생성"
                          />
                        </div>
                        <Button onClick={handleCreateCategory} className="w-full">
                          {editingCategory ? "수정" : "생성"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>URL 식별자</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories?.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {category.description || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.is_active ? "default" : "secondary"}>
                            {category.is_active ? "활성" : "비활성"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!categories?.length && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          카테고리가 없습니다
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Contents Tab */}
          <TabsContent value="contents">
            <div className="flex items-center justify-between mb-6">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingContent(null);
              setFormData({
                course_id: "",
                title: "",
                description: "",
                video_url: "",
                video_provider: "youtube",
                duration_minutes: "",
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                비디오 콘텐츠 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingContent ? "비디오 콘텐츠 수정" : "새 비디오 콘텐츠 추가"}</DialogTitle>
                <DialogDescription>
                  {editingContent 
                    ? "비디오 콘텐츠 정보를 수정합니다" 
                    : "YouTube 또는 Vimeo 링크를 입력하여 강의 콘텐츠를 추가하세요"}
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
                  {editingContent ? "콘텐츠 수정" : "콘텐츠 추가"}
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
                  <TableHead className="text-right">작업</TableHead>
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
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditContent(content)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!contents?.length && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
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
          </TabsContent>

          {/* Tags Tab */}
          <TabsContent value="tags">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>태그 관리</CardTitle>
                    <CardDescription>강좌 태그를 생성하고 관리합니다</CardDescription>
                  </div>
                  <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        태그 추가
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>새 태그 생성</DialogTitle>
                        <DialogDescription>새로운 태그를 생성합니다</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="tag_name">이름</Label>
                          <Input
                            id="tag_name"
                            value={tagFormData.name}
                            onChange={(e) =>
                              setTagFormData({ ...tagFormData, name: e.target.value })
                            }
                            placeholder="태그 이름"
                          />
                        </div>
                        <div>
                          <Label htmlFor="tag_slug">URL 식별자 (선택사항)</Label>
                          <Input
                            id="tag_slug"
                            value={tagFormData.slug}
                            onChange={(e) =>
                              setTagFormData({ ...tagFormData, slug: e.target.value })
                            }
                            placeholder="자동 생성"
                          />
                        </div>
                        <Button onClick={handleCreateTag} className="w-full">
                          생성
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags?.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-sm py-2 px-4">
                      {tag.name}
                    </Badge>
                  ))}
                  {!tags?.length && (
                    <p className="text-muted-foreground text-sm">태그가 없습니다</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminContent;
