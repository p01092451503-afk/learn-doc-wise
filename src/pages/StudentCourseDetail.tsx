import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen, CheckCircle, PlayCircle, Clock } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import VideoPlayer from "@/components/video/VideoPlayer";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  level: string;
  duration_hours: number;
}

interface CourseContent {
  id: string;
  title: string;
  description: string;
  video_url: string;
  video_provider: string;
  duration_minutes: number;
  order_index: number;
  content_type: string;
}

interface ContentProgress {
  content_id: string;
  progress_percentage: number;
  completed: boolean;
}

const StudentCourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [currentContent, setCurrentContent] = useState<CourseContent | null>(null);
  const [progress, setProgress] = useState<ContentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"student" | "teacher" | "admin">("student");

  useEffect(() => {
    checkUserRole();
    if (id) {
      ensureEnrollment();
      fetchCourseDetails();
      fetchCourseContents();
      fetchProgress();
    }
  }, [id]);

  const ensureEnrollment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", id)
        .single();

      // If not enrolled, create enrollment
      if (!existingEnrollment) {
        const { error } = await supabase
          .from("enrollments")
          .insert({
            user_id: user.id,
            course_id: id,
            enrolled_at: new Date().toISOString(),
            progress: 0
          });

        if (error) {
          console.error("Error creating enrollment:", error);
        }
      }
    } catch (error) {
      console.error("Error ensuring enrollment:", error);
    }
  };

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roles?.some(r => r.role === "admin")) {
        setUserRole("admin");
      } else if (roles?.some(r => r.role === "teacher")) {
        setUserRole("teacher");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  };

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
        .eq("is_published", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setContents(data || []);
      if (data && data.length > 0) {
        setCurrentContent(data[0]);
      }
    } catch (error) {
      console.error("Error fetching course contents:", error);
    }
  };

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("content_progress")
        .select("content_id, progress_percentage, completed")
        .eq("user_id", user.id);

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const getContentProgress = (contentId: string) => {
    const contentProgress = progress.find(p => p.content_id === contentId);
    return contentProgress?.progress_percentage || 0;
  };

  const isContentCompleted = (contentId: string) => {
    return progress.some(p => p.content_id === contentId && p.completed);
  };

  const handleProgressUpdate = (progressPercentage: number, position: number) => {
    // Progress is automatically saved in VideoPlayer component
    fetchProgress();
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "beginner": return "초급";
      case "intermediate": return "중급";
      case "advanced": return "고급";
      default: return level;
    }
  };

  const overallProgress = contents.length > 0
    ? (progress.filter(p => contents.some(c => c.id === p.content_id && p.completed)).length / contents.length) * 100
    : 0;

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">강좌 정보를 불러오는 중...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout userRole={userRole}>
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

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="default">{getLevelText(course.level)}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{course.duration_hours}시간</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <PlayCircle className="h-4 w-4" />
                <span>{contents.length}개 차시</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">전체 진행률</span>
                <span className="font-semibold">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {progress.filter(p => contents.some(c => c.id === p.content_id && p.completed)).length}/{contents.length} 차시 완료
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            {currentContent ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{currentContent.title}</CardTitle>
                    {currentContent.description && (
                      <CardDescription>{currentContent.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {currentContent.video_url ? (
                      <VideoPlayer
                        contentId={currentContent.id}
                        videoUrl={currentContent.video_url}
                        videoProvider={currentContent.video_provider as "youtube" | "vimeo" | "direct"}
                        onProgressUpdate={handleProgressUpdate}
                      />
                    ) : (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">동영상이 없습니다</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Tabs defaultValue="description">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="description">강의 정보</TabsTrigger>
                    <TabsTrigger value="notes">학습 노트</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {course.description || "강좌 설명이 없습니다."}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="notes" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">
                          학습 노트 기능은 준비 중입니다.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">왼쪽 목록에서 차시를 선택해주세요</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Curriculum */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>커리큘럼</CardTitle>
                <CardDescription>{contents.length}개 차시</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {contents.length === 0 ? (
                    <p className="text-sm text-center py-8 text-muted-foreground">
                      등록된 차시가 없습니다
                    </p>
                  ) : (
                    contents.map((content, index) => (
                      <div key={content.id}>
                        <div
                          className={`w-full py-3 px-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                            currentContent?.id === content.id ? "bg-primary/10" : ""
                          }`}
                          onClick={() => setCurrentContent(content)}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                              {isContentCompleted(content.id) ? (
                                <CheckCircle className="h-4 w-4 text-accent" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <p className={`text-sm font-medium line-clamp-2 ${
                                currentContent?.id === content.id ? "text-primary" : ""
                              }`}>
                                {content.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {content.duration_minutes}분
                                </span>
                                {getContentProgress(content.id) > 0 && (
                                  <span className="text-xs text-primary font-medium">
                                    {Math.round(getContentProgress(content.id))}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < contents.length - 1 && <Separator className="my-2" />}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCourseDetail;
