import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { BookOpen, Users, Star, DollarSign, Plus, Eye, Edit, Trash2, PlayCircle } from "lucide-react";
import { CourseFormDialog } from "@/components/teacher/CourseFormDialog";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const TeacherCourses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          enrollments(count)
        `)
        .eq("instructor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Calculate mock data for stats since we don't have actual data yet
      const coursesWithStats = data?.map((course: any) => ({
        ...course,
        students: course.enrollments?.[0]?.count || 0,
        rating: 4.5 + Math.random() * 0.5,
        revenue: (course.price || 0) * (course.enrollments?.[0]?.count || 0),
        progress: course.status === "published" ? 100 : 75,
        lessons: 30 + Math.floor(Math.random() * 20),
      })) || [];

      setCourses(coursesWithStats);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "오류",
        description: "강의 목록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const mockCourses = [
    {
      id: 1,
      title: "React 완벽 가이드",
      category: "프론트엔드",
      students: 145,
      rating: 4.9,
      revenue: "₩1,450,000",
      status: "published",
      progress: 100,
      lessons: 42,
    },
    {
      id: 2,
      title: "TypeScript 마스터클래스",
      category: "프로그래밍",
      students: 98,
      rating: 4.7,
      revenue: "₩980,000",
      status: "published",
      progress: 100,
      lessons: 38,
    },
    {
      id: 3,
      title: "Next.js 풀스택 개발",
      category: "프론트엔드",
      students: 76,
      rating: 4.8,
      revenue: "₩760,000",
      status: "published",
      progress: 85,
      lessons: 35,
    },
    {
      id: 4,
      title: "Node.js 백엔드 개발",
      category: "백엔드",
      students: 54,
      rating: 4.6,
      revenue: "₩540,000",
      status: "draft",
      progress: 60,
      lessons: 30,
    },
  ];

  // Use mock data if no real courses exist
  const displayCourses = courses.length > 0 ? courses : mockCourses;

  const handlePreview = (courseId: string | number) => {
    navigate(`/demo`);
  };

  const handleView = (courseId: string | number) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  const handleEdit = (courseId: string | number) => {
    const course = displayCourses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setEditDialogOpen(true);
    }
  };

  const handleDelete = async (courseId: string | number) => {
    if (!confirm("정말 이 강의를 삭제하시겠습니까?")) return;
    
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", String(courseId));

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "강의가 삭제되었습니다.",
      });

      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "오류",
        description: "강의 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSuccess = () => {
    fetchCourses();
  };

  const handleEditSuccess = () => {
    fetchCourses();
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <DashboardLayout userRole="teacher">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">강의 목록을 불러오는 중...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-primary" />
              강의 관리
            </h1>
            <p className="text-muted-foreground">
              모든 강의를 관리하고 새로운 콘텐츠를 제작하세요
            </p>
          </div>
          <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            새 강의 만들기
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="전체 강의"
            value={displayCourses.length.toString()}
            icon={<BookOpen className="h-4 w-4" />}
            description={`${displayCourses.filter(c => c.status === 'published').length} 공개, ${displayCourses.filter(c => c.status === 'draft').length} 준비중`}
          />
          <StatsCard
            title="총 수강생"
            value={displayCourses.reduce((sum, c) => sum + (c.students || 0), 0).toString()}
            icon={<Users className="h-4 w-4" />}
            description="전체 강의 합계"
          />
          <StatsCard
            title="평균 평점"
            value={(displayCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / Math.max(displayCourses.length, 1)).toFixed(2)}
            icon={<Star className="h-4 w-4" />}
            description={`${displayCourses.length}개 강의 기준`}
          />
          <StatsCard
            title="총 수익"
            value={`₩${displayCourses.reduce((sum, c) => sum + (c.revenue || 0), 0).toLocaleString()}`}
            icon={<DollarSign className="h-4 w-4" />}
            description="누적 수익"
          />
        </div>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>내 강의 목록</CardTitle>
            <CardDescription>강의를 클릭하여 상세 정보를 확인하고 편집하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>강의명</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead className="text-center">수강생</TableHead>
                  <TableHead className="text-center">평점</TableHead>
                  <TableHead className="text-center">진행률</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">수익</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.lessons}개 레슨</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{course.students}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{course.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.status === "published" ? "default" : "secondary"}>
                        {course.status === "published" ? "공개" : course.status === "draft" ? "준비중" : "보관됨"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{course.revenue}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handlePreview(course.id)} title="미리보기">
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleView(course.id)} title="상세보기">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(course.id)} title="편집">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(course.id)} title="삭제">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <CourseFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <CourseFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        course={selectedCourse}
        onSuccess={handleEditSuccess}
      />
    </DashboardLayout>
  );
};

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  description: string; 
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium whitespace-nowrap">{title}</CardTitle>
      <div className="text-muted-foreground flex-shrink-0">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-1 min-w-0">
      <div className="text-xl font-bold break-all">{value}</div>
      <p className="text-xs text-muted-foreground whitespace-nowrap">{description}</p>
    </CardContent>
  </Card>
);

export default TeacherCourses;
