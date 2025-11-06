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
import { Plus, Search, Edit, Trash2, BookOpen, Tag, FolderTree } from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  level: string;
  price: number;
  duration_hours: number;
  instructor_id: string | null;
  category_id: string | null;
  publish_date: string | null;
  is_featured: boolean;
  version: number;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Teacher {
  id: string;
  full_name: string;
  email: string;
}

const AdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    status: "draft",
    level: "beginner",
    price: 0,
    duration_hours: 0,
    category_id: "",
    instructor_id: "",
    publish_date: "",
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

  const [tagForm, setTagForm] = useState({
    name: "",
    slug: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

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
        
      const tagsResult = await supabase
        .from("tags")
        .select("*");

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

      if (tagsResult.error) {
        console.error("Tags fetch error:", tagsResult.error);
      } else {
        setTags(tagsResult.data || []);
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

  const generateUniqueSlug = async (baseSlug: string, excludeId?: string): Promise<string> => {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const query = supabase
        .from("courses")
        .select("id")
        .eq("slug", slug);

      // 수정 중인 경우 현재 강좌 ID는 제외
      if (excludeId) {
        query.neq("id", excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // slug가 중복되지 않으면 사용
      if (!data || data.length === 0) {
        return slug;
      }

      // 중복되면 숫자 추가
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  };

  const handleCreateCourse = async () => {
    try {
      // slug 생성
      let baseSlug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      
      // 고유한 slug 생성
      const uniqueSlug = await generateUniqueSlug(baseSlug, editingCourse?.id);

      const courseData: any = {
        title: formData.title,
        slug: uniqueSlug,
        description: formData.description,
        status: formData.status,
        level: formData.level,
        price: formData.price,
        duration_hours: formData.duration_hours,
        category_id: formData.category_id || null,
        publish_date: formData.publish_date || null,
        instructor_id: formData.instructor_id || null,
        course_type: formData.course_type,
        live_meeting_url: formData.course_type === 'live' ? formData.live_meeting_url : null,
        live_meeting_provider: formData.course_type === 'live' ? formData.live_meeting_provider : null,
        live_scheduled_at: formData.course_type === 'live' && formData.live_scheduled_at ? formData.live_scheduled_at : null,
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

      setIsDialogOpen(false);
      setEditingCourse(null);
      fetchData();
      resetForm();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "강좌 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || "",
      status: course.status,
      level: course.level,
      price: parseFloat(course.price.toString()),
      duration_hours: course.duration_hours,
      category_id: course.category_id || "",
      instructor_id: course.instructor_id || "",
      publish_date: course.publish_date ? new Date(course.publish_date).toISOString().slice(0, 16) : "",
      course_type: (course as any).course_type || "vod",
      live_meeting_url: (course as any).live_meeting_url || "",
      live_meeting_provider: (course as any).live_meeting_provider || "zoom",
      live_scheduled_at: (course as any).live_scheduled_at ? new Date((course as any).live_scheduled_at).toISOString().slice(0, 16) : "",
    });
    setIsDialogOpen(true);
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

      fetchData();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCategory = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!categoryForm.name.trim()) {
        toast({
          title: "오류",
          description: "카테고리명을 입력해주세요.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const categoryData = {
        name: categoryForm.name.trim(),
        slug: categoryForm.slug?.trim() || categoryForm.name.trim().toLowerCase().replace(/\s+/g, "-"),
        description: categoryForm.description?.trim() || null,
        is_active: true,
      };

      const { data, error } = await supabase.from("categories").insert([categoryData]).select();

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "중복 오류",
            description: `'${categoryForm.name.trim()}' 카테고리명이 이미 존재합니다. 다른 이름을 사용해주세요.`,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        throw error;
      }

      toast({
        title: "성공",
        description: "카테고리가 생성되었습니다.",
      });

      setIsCategoryDialogOpen(false);
      setCategoryForm({ name: "", slug: "", description: "" });
      await fetchData();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "카테고리 생성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTag = async () => {
    try {
      const { error } = await supabase.from("tags").insert([{
        name: tagForm.name,
        slug: tagForm.slug || tagForm.name.toLowerCase().replace(/\s+/g, "-"),
      }]);

      if (error) throw error;

      toast({
        title: "성공",
        description: "태그가 생성되었습니다.",
      });

      setIsTagDialogOpen(false);
      fetchData();
      setTagForm({ name: "", slug: "" });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "태그 생성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      status: "draft",
      level: "beginner",
      price: 0,
      duration_hours: 0,
      category_id: "",
      instructor_id: "",
      publish_date: "",
      course_type: "vod",
      live_meeting_url: "",
      live_meeting_provider: "zoom",
      live_scheduled_at: "",
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
              강좌 관리
            </h1>
            <p className="text-muted-foreground mt-2">강좌 생성, 수정, 카테고리 및 태그 관리</p>
          </div>
        </div>

        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">
              <FolderTree className="h-4 w-4 mr-2" />
              카테고리
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="h-4 w-4 mr-2" />
              강좌 목록
            </TabsTrigger>
            <TabsTrigger value="tags">
              <Tag className="h-4 w-4 mr-2" />
              태그
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <div className="flex items-center justify-end gap-4">
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setEditingCourse(null);
                  resetForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    강좌 추가
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingCourse ? "강좌 수정" : "새 강좌 생성"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>강좌명 *</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="예: React 완벽 가이드"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>슬러그</Label>
                        <Input
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="자동 생성"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>설명</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="강좌 설명을 입력하세요"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>강의 유형 *</Label>
                        <Select value={formData.course_type} onValueChange={(value) => setFormData({ ...formData, course_type: value })}>
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
                        <Select value={formData.instructor_id} onValueChange={(value) => setFormData({ ...formData, instructor_id: value })}>
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

                    {formData.course_type === 'live' && (
                      <>
                        <div className="space-y-2">
                          <Label>라이브 미팅 플랫폼 *</Label>
                          <Select value={formData.live_meeting_provider} onValueChange={(value) => setFormData({ ...formData, live_meeting_provider: value })}>
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
                            value={formData.live_meeting_url}
                            onChange={(e) => setFormData({ ...formData, live_meeting_url: e.target.value })}
                            placeholder="예: https://zoom.us/j/123456789"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>라이브 시작 시간 *</Label>
                          <Input
                            type="datetime-local"
                            value={formData.live_scheduled_at}
                            onChange={(e) => setFormData({ ...formData, live_scheduled_at: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>카테고리</Label>
                        <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="카테고리 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>난이도</Label>
                        <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
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
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>총 시간 (시간)</Label>
                        <Input
                          type="number"
                          value={formData.duration_hours}
                          onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>상태</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">초안</SelectItem>
                            <SelectItem value="published">공개</SelectItem>
                            <SelectItem value="scheduled">예약 공개</SelectItem>
                            <SelectItem value="archived">보관</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>공개 예약 일시</Label>
                      <Input
                        type="datetime-local"
                        value={formData.publish_date}
                        onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleCreateCourse}>
                      {editingCourse ? "수정" : "생성"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>강좌 목록 ({courses.length}개)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>강좌명</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>난이도</TableHead>
                      <TableHead>가격</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>버전</TableHead>
                      <TableHead>생성일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>
                          {categories.find(c => c.id === course.category_id)?.name || "-"}
                        </TableCell>
                        <TableCell>{getLevelBadge(course.level)}</TableCell>
                        <TableCell>₩{course.price.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(course.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">v{course.version}</Badge>
                        </TableCell>
                        <TableCell>{new Date(course.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCourse(course)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    카테고리 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 카테고리 생성</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>카테고리명 *</Label>
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
                        placeholder="카테고리 설명"
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
                      {isSubmitting ? "처리 중..." : "생성"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>카테고리 목록 ({categories.length}개)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>슬러그</TableHead>
                      <TableHead>상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          등록된 카테고리가 없습니다. 카테고리를 추가해주세요.
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                          <TableCell>
                            <Badge variant={category.is_active ? "default" : "secondary"}>
                              {category.is_active ? "활성" : "비활성"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    태그 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 태그 생성</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>태그명 *</Label>
                      <Input
                        value={tagForm.name}
                        onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                        placeholder="예: React"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>슬러그</Label>
                      <Input
                        value={tagForm.slug}
                        onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })}
                        placeholder="자동 생성"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleCreateTag}>생성</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>태그 목록 ({tags.length}개)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-sm px-3 py-1">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminCourses;
