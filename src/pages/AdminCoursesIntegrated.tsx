import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, BookOpen, FolderTree, PlayCircle, ArrowLeft, Video, Upload, Eye } from "lucide-react";
import VideoPreview from "@/components/video/VideoPreview";
import * as XLSX from "xlsx";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  level: string;
  price: number;
  duration_hours: number;
  category_id: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
}

interface Content {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  video_url: string | null;
  video_provider: string | null;
  duration_minutes: number;
  order_index: number;
  is_published: boolean;
  course_id: string;
}

interface Teacher {
  id: string;
  full_name: string;
  email: string;
}

const AdminCoursesIntegrated = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<Content | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [courseForm, setCourseForm] = useState({
    title: "",
    slug: "",
    description: "",
    status: "draft",
    level: "beginner",
    price: 0,
    duration_hours: 0,
    category_id: "",
    instructor_id: "",
    course_type: "vod",
    live_meeting_url: "",
    live_meeting_provider: "zoom",
    live_scheduled_at: "",
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const [contentForm, setContentForm] = useState({
    title: "",
    description: "",
    video_url: "",
    video_provider: "youtube" as "youtube" | "vimeo",
    duration_minutes: 0,
    order_index: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchContents(selectedCourse.id);
    }
  }, [selectedCourse]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 각 쿼리를 독립적으로 처리하여 하나가 실패해도 다른 데이터는 로드되도록 함
      const coursesResult = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      
      const categoriesResult = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (coursesResult.error) {
        console.error("Courses fetch error:", coursesResult.error);
      } else {
        setCourses(coursesResult.data || []);
      }

      if (categoriesResult.error) {
        console.error("Categories fetch error:", categoriesResult.error);
      } else {
        console.log("Fetched categories:", categoriesResult.data);
        setCategories(categoriesResult.data || []);
      }

      // teachers는 선택적으로 로드 (오류가 나도 다른 데이터는 표시)
      try {
        const teachersResult = await supabase
          .from("user_roles")
          .select("user_id, profiles(id, full_name, email)")
          .eq("role", "teacher");
        
        if (teachersResult.error) {
          console.error("Teachers fetch error:", teachersResult.error);
          setTeachers([]);
        } else {
          const teachersList = teachersResult.data
            ?.map((item: any) => ({
              id: item.user_id,
              full_name: item.profiles?.full_name || "이름 없음",
              email: item.profiles?.email || "",
            }))
            .filter((t: Teacher) => t.id) || [];
          
          setTeachers(teachersList);
        }
      } catch (teacherError) {
        console.error("Teachers query failed:", teacherError);
        setTeachers([]);
      }

    } catch (error: any) {
      console.error("Fetch data error:", error);
      toast({
        title: "오류",
        description: error.message || "데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchContents = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from("course_contents")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (error) throw error;
      setContents(data || []);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "차시 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCreateCourse = async () => {
    try {
      const baseSlug = courseForm.slug || courseForm.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      
      const courseData: any = {
        title: courseForm.title,
        slug: baseSlug,
        description: courseForm.description,
        status: courseForm.status,
        level: courseForm.level,
        price: courseForm.price,
        duration_hours: courseForm.duration_hours,
        category_id: courseForm.category_id || null,
        instructor_id: courseForm.instructor_id || null,
        course_type: courseForm.course_type,
        live_meeting_url: courseForm.course_type === 'live' ? courseForm.live_meeting_url : null,
        live_meeting_provider: courseForm.course_type === 'live' ? courseForm.live_meeting_provider : null,
        live_scheduled_at: courseForm.course_type === 'live' && courseForm.live_scheduled_at ? courseForm.live_scheduled_at : null,
      };

      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update(courseData)
          .eq("id", editingCourse.id);

        if (error) throw error;

        toast({
          title: "성공",
          description: "강좌가 수정되었습니다.",
        });
      } else {
        const { error } = await supabase.from("courses").insert([courseData]);

        if (error) throw error;

        toast({
          title: "성공",
          description: "강좌가 생성되었습니다.",
        });
      }

      setIsCourseDialogOpen(false);
      setEditingCourse(null);
      fetchData();
      resetCourseForm();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "강좌 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCreateCategory = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!categoryForm.name.trim()) {
        toast({
          title: "오류",
          description: "분류명을 입력해주세요.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const categoryData: any = {
        name: categoryForm.name.trim(),
        slug: categoryForm.slug?.trim() || categoryForm.name.trim().toLowerCase().replace(/\s+/g, "-"),
        description: categoryForm.description?.trim() || null,
        is_active: true,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", editingCategory.id);

        if (error) {
          if (error.code === '23505') {
            toast({
              title: "중복 오류",
              description: `'${categoryForm.name.trim()}' 분류명이 이미 존재합니다. 다른 이름을 사용해주세요.`,
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
          throw error;
        }

        toast({
          title: "성공",
          description: "분류가 수정되었습니다.",
        });
      } else {
        const { data, error } = await supabase
          .from("categories")
          .insert([categoryData])
          .select();

        if (error) {
          if (error.code === '23505') {
            toast({
              title: "중복 오류",
              description: `'${categoryForm.name.trim()}' 분류명이 이미 존재합니다. 다른 이름을 사용해주세요.`,
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
          throw error;
        }

        toast({
          title: "성공",
          description: "분류가 생성되었습니다.",
        });
      }

      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      resetCategoryForm();
      await fetchData();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "분류 저장에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateContent = async () => {
    if (!selectedCourse) return;

    try {
      const contentData: any = {
        course_id: selectedCourse.id,
        title: contentForm.title,
        description: contentForm.description,
        video_url: contentForm.video_url,
        video_provider: contentForm.video_provider,
        duration_minutes: contentForm.duration_minutes,
        order_index: contentForm.order_index,
        content_type: "video",
        is_published: true,
      };

      if (editingContent) {
        const { error } = await supabase
          .from("course_contents")
          .update(contentData)
          .eq("id", editingContent.id);

        if (error) throw error;

        toast({
          title: "성공",
          description: "차시가 수정되었습니다.",
        });
      } else {
        const { error } = await supabase.from("course_contents").insert([contentData]);

        if (error) throw error;

        toast({
          title: "성공",
          description: "차시가 생성되었습니다.",
        });
      }

      setIsContentDialogOpen(false);
      setEditingContent(null);
      fetchContents(selectedCourse.id);
      resetContentForm();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "차시 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase.from("courses").delete().eq("id", courseId);

      if (error) throw error;

      toast({
        title: "성공",
        description: "강좌가 삭제되었습니다.",
      });

      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
      }
      fetchData();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase.from("categories").delete().eq("id", categoryId);

      if (error) throw error;

      toast({
        title: "성공",
        description: "분류가 삭제되었습니다.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase.from("course_contents").delete().eq("id", contentId);

      if (error) throw error;

      toast({
        title: "성공",
        description: "차시가 삭제되었습니다.",
      });

      if (selectedCourse) {
        fetchContents(selectedCourse.id);
      }
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: "",
      slug: "",
      description: "",
      status: "draft",
      level: "beginner",
      price: 0,
      duration_hours: 0,
      category_id: "",
      instructor_id: "",
      course_type: "vod",
      live_meeting_url: "",
      live_meeting_provider: "zoom",
      live_scheduled_at: "",
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      slug: "",
      description: "",
    });
  };

  const resetContentForm = () => {
    setContentForm({
      title: "",
      description: "",
      video_url: "",
      video_provider: "youtube",
      duration_minutes: 0,
      order_index: 0,
    });
    setShowPreview(false);
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCourse) return;
    
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

          if (jsonData.length === 0) {
            toast({
              title: "오류",
              description: "파일에 데이터가 없습니다.",
              variant: "destructive",
            });
            return;
          }

          // 일괄 삽입할 데이터 준비
          const bulkContents = jsonData.map((row, index) => ({
            course_id: selectedCourse.id,
            title: row["차시명"] || row["title"] || `차시 ${index + 1}`,
            description: row["설명"] || row["description"] || "",
            video_url: row["비디오URL"] || row["video_url"] || "",
            video_provider: (row["제공자"] || row["provider"] || "youtube").toLowerCase() as "youtube" | "vimeo",
            duration_minutes: parseInt(row["재생시간"] || row["duration"] || "0"),
            order_index: contents.length + index,
            content_type: "video" as const,
            is_published: true,
          }));

          const { error } = await supabase.from("course_contents").insert(bulkContents);

          if (error) throw error;

          toast({
            title: "성공",
            description: `${bulkContents.length}개의 차시가 추가되었습니다.`,
          });

          fetchContents(selectedCourse.id);
        } catch (error: any) {
          toast({
            title: "오류",
            description: error.message || "파일 처리 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "파일 업로드에 실패했습니다.",
        variant: "destructive",
      });
    }

    // Reset input
    event.target.value = "";
  };

  const downloadTemplate = () => {
    const template = [
      {
        "차시명": "1강. 강의 소개",
        "설명": "강의의 전반적인 내용을 소개합니다",
        "비디오URL": "https://youtube.com/watch?v=example",
        "제공자": "youtube",
        "재생시간": "15"
      },
      {
        "차시명": "2강. 주요 개념",
        "설명": "핵심 개념을 설명합니다",
        "비디오URL": "https://youtube.com/watch?v=example2",
        "제공자": "youtube",
        "재생시간": "20"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "차시목록");
    XLSX.writeFile(wb, "차시_일괄업로드_템플릿.xlsx");

    toast({
      title: "다운로드 완료",
      description: "템플릿 파일을 다운로드했습니다.",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      published: "default",
      draft: "secondary",
      scheduled: "outline",
      archived: "destructive",
    };
    const labels: Record<string, string> = {
      published: "공개",
      draft: "초안",
      scheduled: "예약",
      archived: "보관",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const labels: Record<string, string> = {
      beginner: "초급",
      intermediate: "중급",
      advanced: "고급",
      all: "전체",
    };
    return <Badge variant="outline">{labels[level] || level}</Badge>;
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-primary" />
              강좌 & 차시 관리
            </h1>
            <p className="text-muted-foreground mt-2">강좌 생성 및 차시 관리를 한곳에서</p>
          </div>
        </div>

        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">
              <FolderTree className="h-4 w-4 mr-2" />
              분류 관리
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="h-4 w-4 mr-2" />
              강의 관리
            </TabsTrigger>
          </TabsList>

          {/* 분류 관리 탭 */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex items-center justify-end">
              <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => {
                setIsCategoryDialogOpen(open);
                if (!open) {
                  setEditingCategory(null);
                  resetCategoryForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingCategory(null);
                    resetCategoryForm();
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    분류 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? "분류 수정" : "새 분류 생성"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>분류명 *</Label>
                      <Input
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="예: 프로그래밍"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>슬러그</Label>
                      <Input
                        value={categoryForm.slug}
                        onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                        placeholder="자동 생성"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>설명</Label>
                      <Textarea
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        placeholder="분류 설명"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCategoryDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      취소
                    </Button>
                    <Button 
                      onClick={handleCreateCategory}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "처리 중..." : (editingCategory ? "수정" : "생성")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>분류명</TableHead>
                      <TableHead>슬러그</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          등록된 분류가 없습니다. 분류를 추가해주세요.
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{category.slug}</Badge>
                          </TableCell>
                          <TableCell className="max-w-md truncate">{category.description}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setCategoryForm({
                                    name: category.name,
                                    slug: category.slug,
                                    description: category.description || "",
                                  });
                                  setIsCategoryDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 강의 관리 탭 */}
          <TabsContent value="courses" className="space-y-4">
            {!selectedCourse ? (
              // 강의 목록 뷰
              <>
                <div className="flex items-center justify-end">
                  <Dialog open={isCourseDialogOpen} onOpenChange={(open) => {
                    setIsCourseDialogOpen(open);
                    if (!open) {
                      setEditingCourse(null);
                      resetCourseForm();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        강의 개설
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingCourse ? "강의 수정" : "새 강의 개설"}</DialogTitle>
                      </DialogHeader>
                       <div className="space-y-4 py-4">
                         <div className="space-y-2">
                          <Label>강의명 *</Label>
                          <Input
                            value={courseForm.title}
                            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                            placeholder="예: React 완벽 가이드"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>강의 유형 *</Label>
                            <Select value={courseForm.course_type} onValueChange={(value) => setCourseForm({ ...courseForm, course_type: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="vod">VOD (녹화강의)</SelectItem>
                                <SelectItem value="live">LIVE (실시간)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>담당 강사 *</Label>
                            <Select value={courseForm.instructor_id} onValueChange={(value) => setCourseForm({ ...courseForm, instructor_id: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="강사를 선택하세요" />
                              </SelectTrigger>
                              <SelectContent>
                                {teachers.map((teacher) => (
                                  <SelectItem key={teacher.id} value={teacher.id}>
                                    {teacher.full_name} ({teacher.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>분류 *</Label>
                          <Select value={courseForm.category_id} onValueChange={(value) => setCourseForm({ ...courseForm, category_id: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="분류 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {courseForm.course_type === 'live' && (
                          <>
                            <div className="space-y-2">
                              <Label>라이브 미팅 플랫폼 *</Label>
                              <Select value={courseForm.live_meeting_provider} onValueChange={(value) => setCourseForm({ ...courseForm, live_meeting_provider: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="zoom">Zoom</SelectItem>
                                  <SelectItem value="google_meet">Google Meet</SelectItem>
                                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                                  <SelectItem value="other">기타</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>라이브 미팅 URL *</Label>
                              <Input
                                value={courseForm.live_meeting_url}
                                onChange={(e) => setCourseForm({ ...courseForm, live_meeting_url: e.target.value })}
                                placeholder="예: https://zoom.us/j/123456789"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>라이브 시작 시간 *</Label>
                              <Input
                                type="datetime-local"
                                value={courseForm.live_scheduled_at}
                                onChange={(e) => setCourseForm({ ...courseForm, live_scheduled_at: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        <div className="space-y-2">
                          <Label>설명</Label>
                          <Textarea
                            value={courseForm.description}
                            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                            placeholder="강의 설명을 입력하세요"
                            rows={4}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>난이도</Label>
                            <Select value={courseForm.level} onValueChange={(value) => setCourseForm({ ...courseForm, level: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">초급</SelectItem>
                                <SelectItem value="intermediate">중급</SelectItem>
                                <SelectItem value="advanced">고급</SelectItem>
                                <SelectItem value="all">전체</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>가격 (원)</Label>
                            <Input
                              type="number"
                              value={courseForm.price}
                              onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>상태</Label>
                          <Select value={courseForm.status} onValueChange={(value) => setCourseForm({ ...courseForm, status: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">초안</SelectItem>
                              <SelectItem value="published">공개</SelectItem>
                              <SelectItem value="archived">보관</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCourseDialogOpen(false)}>
                          취소
                        </Button>
                        <Button onClick={handleCreateCourse}>
                          {editingCourse ? "수정" : "생성"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCourse(course)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              {getStatusBadge(course.status)}
                              {getLevelBadge(course.level)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-3 mb-4">
                          {course.description || "설명이 없습니다."}
                        </CardDescription>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{course.price > 0 ? `₩${course.price.toLocaleString()}` : "무료"}</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCourse(course);
                                setCourseForm({
                                  title: course.title,
                                  slug: course.slug,
                                  description: course.description || "",
                                  status: course.status,
                                  level: course.level,
                                  price: parseFloat(course.price.toString()),
                                  duration_hours: course.duration_hours,
                                  category_id: course.category_id || "",
                                  instructor_id: (course as any).instructor_id || "",
                                  course_type: (course as any).course_type || "vod",
                                  live_meeting_url: (course as any).live_meeting_url || "",
                                  live_meeting_provider: (course as any).live_meeting_provider || "zoom",
                                  live_scheduled_at: (course as any).live_scheduled_at ? new Date((course as any).live_scheduled_at).toISOString().slice(0, 16) : "",
                                });
                                setIsCourseDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCourse(course.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              // 차시 관리 뷰
              <>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setSelectedCourse(null)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    강의 목록으로
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={downloadTemplate}>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      템플릿 다운로드
                    </Button>
                    <Button variant="outline" asChild>
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        일괄 업로드
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          className="hidden"
                          onChange={handleBulkUpload}
                        />
                      </label>
                    </Button>
                    <Dialog open={isContentDialogOpen} onOpenChange={(open) => {
                      setIsContentDialogOpen(open);
                      if (!open) {
                        setEditingContent(null);
                        resetContentForm();
                      } else {
                        // Dialog 열릴 때 order_index 설정
                        if (!editingContent) {
                          setContentForm(prev => ({
                            ...prev,
                            order_index: contents.length
                          }));
                        }
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          차시 추가
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingContent ? "차시 수정" : "새 차시 생성"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>차시명 *</Label>
                          <Input
                            value={contentForm.title}
                            onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                            placeholder="예: 1강. React 소개"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>설명</Label>
                          <Textarea
                            value={contentForm.description}
                            onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                            placeholder="차시 설명"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>비디오 제공자</Label>
                            <Select value={contentForm.video_provider} onValueChange={(value: "youtube" | "vimeo") => setContentForm({ ...contentForm, video_provider: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="vimeo">Vimeo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>재생 시간 (분)</Label>
                            <Input
                              type="number"
                              value={contentForm.duration_minutes}
                              onChange={(e) => setContentForm({ ...contentForm, duration_minutes: parseInt(e.target.value) || 0 })}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>비디오 URL</Label>
                          <div className="flex gap-2">
                            <Input
                              value={contentForm.video_url}
                              onChange={(e) => setContentForm({ ...contentForm, video_url: e.target.value })}
                              placeholder="https://youtube.com/watch?v=..."
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowPreview(!showPreview)}
                              disabled={!contentForm.video_url}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {showPreview && contentForm.video_url && (
                          <div className="space-y-2">
                            <Label>영상 미리보기</Label>
                            <VideoPreview
                              videoUrl={contentForm.video_url}
                              videoProvider={contentForm.video_provider}
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>순서</Label>
                          <Input
                            type="number"
                            value={contentForm.order_index}
                            onChange={(e) => setContentForm({ ...contentForm, order_index: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsContentDialogOpen(false)}>
                          취소
                        </Button>
                        <Button onClick={handleCreateContent}>
                          {editingContent ? "수정" : "생성"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-primary" />
                      {selectedCourse.title} - 차시 목록
                    </CardTitle>
                    <CardDescription>
                      총 {contents.length}개의 차시
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">순서</TableHead>
                          <TableHead>차시명</TableHead>
                          <TableHead>재생시간</TableHead>
                          <TableHead>제공자</TableHead>
                          <TableHead className="w-24">미리보기</TableHead>
                          <TableHead className="text-right">관리</TableHead>
                        </TableRow>
                      </TableHeader>
                        <TableBody>
                        {contents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              차시가 없습니다. 차시를 추가해주세요.
                            </TableCell>
                          </TableRow>
                        ) : (
                          contents.map((content) => (
                            <TableRow key={content.id}>
                              <TableCell>
                                <Badge variant="outline">{content.order_index + 1}</Badge>
                              </TableCell>
                              <TableCell className="font-medium">{content.title}</TableCell>
                              <TableCell>{content.duration_minutes}분</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {content.video_provider === "youtube" ? "YouTube" : "Vimeo"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setPreviewContent(content)}
                                  disabled={!content.video_url}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingContent(content);
                                      setContentForm({
                                        title: content.title,
                                        description: content.description || "",
                                        video_url: content.video_url || "",
                                        video_provider: (content.video_provider as "youtube" | "vimeo") || "youtube",
                                        duration_minutes: content.duration_minutes,
                                        order_index: content.order_index,
                                      });
                                      setIsContentDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteContent(content.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* 영상 미리보기 Dialog */}
                <Dialog open={!!previewContent} onOpenChange={() => setPreviewContent(null)}>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>{previewContent?.title}</DialogTitle>
                      {previewContent?.description && (
                        <CardDescription>{previewContent.description}</CardDescription>
                      )}
                    </DialogHeader>
                    {previewContent?.video_url && previewContent?.video_provider && (
                      <VideoPreview
                        videoUrl={previewContent.video_url}
                        videoProvider={previewContent.video_provider as "youtube" | "vimeo"}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminCoursesIntegrated;
