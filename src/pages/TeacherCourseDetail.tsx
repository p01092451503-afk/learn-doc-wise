import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen, Users, PlayCircle, Clock, MessageSquare, FileText, Settings } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { CourseChatRoom } from "@/components/course/CourseChatRoom";
import { AtomSpinner } from "@/components/AtomSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  level: string;
  duration_hours: number;
  status: string;
  price: number;
}

interface CourseContent {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  order_index: number;
  is_published: boolean;
}

interface Enrollment {
  id: string;
  user_id: string;
  progress: number;
  enrolled_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

const TeacherCourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
      fetchCourseContents();
      fetchEnrollments();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast({
        title: "오류",
        description: "강좌 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseContents = async () => {
    try {
      const { data, error } = await supabase
        .from("course_contents")
        .select("*")
        .eq("course_id", id)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error("Error fetching course contents:", error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const { data: enrollmentsData, error } = await supabase
        .from("enrollments")
        .select("id, user_id, progress, enrolled_at")
        .eq("course_id", id);

      if (error) throw error;

      if (!enrollmentsData || enrollmentsData.length === 0) {
        setEnrollments([]);
        return;
      }

      // Fetch profiles separately
      const userIds = enrollmentsData.map(e => e.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      // Merge enrollments with profiles
      const enrichedEnrollments = enrollmentsData.map(enrollment => ({
        ...enrollment,
        profiles: profilesData?.find(p => p.user_id === enrollment.user_id) || {
          full_name: "이름 없음",
          avatar_url: ""
        }
      }));

      setEnrollments(enrichedEnrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "beginner": return "초급";
      case "intermediate": return "중급";
      case "advanced": return "고급";
      default: return level;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default">공개</Badge>;
      case "draft":
        return <Badge variant="secondary">준비중</Badge>;
      case "archived":
        return <Badge variant="outline">보관됨</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="teacher">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AtomSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">강좌 정보를 불러오는 중...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout userRole="teacher">
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">강좌를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-6">요청하신 강좌가 존재하지 않거나 접근 권한이 없습니다</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const avgProgress = enrollments.length > 0
    ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
    : 0;

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
              {getStatusBadge(course.status)}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline">{getLevelText(course.level)}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{course.duration_hours}시간</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <PlayCircle className="h-4 w-4" />
                <span>{contents.length}개 차시</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{enrollments.length}명 수강중</span>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(`/teacher/courses`)}>
            <Settings className="h-4 w-4 mr-2" />
            강의 편집
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 수강생</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
              <p className="text-xs text-muted-foreground">등록된 학생 수</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 진행률</CardTitle>
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(avgProgress)}%</div>
              <p className="text-xs text-muted-foreground">전체 학생 평균</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">콘텐츠</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contents.length}</div>
              <p className="text-xs text-muted-foreground">
                {contents.filter(c => c.is_published).length}개 공개됨
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">수업 시간</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{course.duration_hours}h</div>
              <p className="text-xs text-muted-foreground">총 강의 시간</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">강의 개요</TabsTrigger>
            <TabsTrigger value="students">수강생 관리</TabsTrigger>
            <TabsTrigger value="chat">실시간 Q&A</TabsTrigger>
            <TabsTrigger value="contents">콘텐츠 목록</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>강의 설명</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {course.description || "강의 설명이 없습니다."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>강의 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">난이도</p>
                    <p className="text-base mt-1">{getLevelText(course.level)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">가격</p>
                    <p className="text-base mt-1">₩{course.price?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">총 강의 시간</p>
                    <p className="text-base mt-1">{course.duration_hours}시간</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">강의 상태</p>
                    <p className="text-base mt-1">{getStatusBadge(course.status)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>수강생 목록</CardTitle>
                <CardDescription>
                  현재 {enrollments.length}명의 학생이 이 강의를 수강 중입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">아직 수강생이 없습니다</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>학생 이름</TableHead>
                        <TableHead>등록일</TableHead>
                        <TableHead>진행률</TableHead>
                        <TableHead className="text-right">상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            {enrollment.profiles?.full_name || "이름 없음"}
                          </TableCell>
                          <TableCell>
                            {new Date(enrollment.enrolled_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={enrollment.progress || 0} 
                                className="w-24 h-2"
                              />
                              <span className="text-xs text-muted-foreground">
                                {Math.round(enrollment.progress || 0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {(enrollment.progress || 0) >= 100 ? (
                              <Badge variant="default">완료</Badge>
                            ) : (enrollment.progress || 0) > 0 ? (
                              <Badge variant="secondary">진행중</Badge>
                            ) : (
                              <Badge variant="outline">시작 전</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  실시간 Q&A
                </CardTitle>
                <CardDescription>
                  학생들의 질문에 실시간으로 답변할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CourseChatRoom courseId={id!} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>강의 콘텐츠 목록</CardTitle>
                <CardDescription>
                  총 {contents.length}개의 콘텐츠가 등록되어 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">등록된 콘텐츠가 없습니다</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">순서</TableHead>
                        <TableHead>제목</TableHead>
                        <TableHead>시간</TableHead>
                        <TableHead className="text-right">상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contents.map((content) => (
                        <TableRow key={content.id}>
                          <TableCell className="font-medium">
                            {content.order_index}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{content.title}</p>
                              {content.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {content.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {content.duration_minutes}분
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {content.is_published ? (
                              <Badge variant="default">공개</Badge>
                            ) : (
                              <Badge variant="secondary">비공개</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TeacherCourseDetail;
