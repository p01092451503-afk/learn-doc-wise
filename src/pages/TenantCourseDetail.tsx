import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BarChart, BookOpen, Award, ChevronLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import VideoPreview from "@/components/video/VideoPreview";
import { AtomSpinner } from "@/components/AtomSpinner";

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  price: number;
  duration_hours: number;
  thumbnail_url: string;
  categories: { name: string };
}

const TenantCourseDetail = () => {
  const { subdomain, courseSlug } = useParams<{ subdomain: string; courseSlug: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [courseContents, setCourseContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState("");

  useEffect(() => {
    fetchTenantInfo();
    fetchCourseDetail();
    fetchCourseContents();
  }, [subdomain, courseSlug]);

  const fetchTenantInfo = async () => {
    try {
      const { data } = await supabase
        .from("tenants")
        .select("name, id")
        .eq("subdomain", subdomain)
        .single();
      
      if (data) {
        setTenantName(data.name);
        const { data: settings } = await supabase
          .from("tenant_settings")
          .select("custom_styles")
          .eq("tenant_id", data.id)
          .single();
        
        const styles = settings?.custom_styles as any;
        if (styles?.primaryColor) {
          document.documentElement.style.setProperty('--primary', styles.primaryColor);
        }
      }
    } catch (error) {
      console.error("Error fetching tenant info:", error);
    }
  };

  const fetchCourseDetail = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          categories (name)
        `)
        .eq("slug", courseSlug)
        .eq("status", "published")
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseContents = async () => {
    try {
      const { data: courseData } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", courseSlug)
        .single();

      if (courseData) {
        const { data, error } = await supabase
          .from("course_contents")
          .select("*")
          .eq("course_id", courseData.id)
          .eq("is_published", true)
          .order("order_index");

        if (error) throw error;
        setCourseContents(data || []);
      }
    } catch (error) {
      console.error("Error fetching course contents:", error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AtomSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>강좌를 찾을 수 없습니다</CardTitle>
            <CardDescription>
              요청하신 강좌가 존재하지 않습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to={`/tenant/${subdomain}/courses`}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                강좌 목록으로
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const previewContent = courseContents.find(c => c.is_preview);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={`/tenant/${subdomain}`} className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{tenantName}</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to={`/tenant/${subdomain}`} className="text-sm font-medium hover:text-primary transition-colors">
                홈
              </Link>
              <Link to={`/tenant/${subdomain}/courses`} className="text-sm font-medium hover:text-primary transition-colors">
                강좌
              </Link>
              <Link to="/auth" className="text-sm font-medium hover:text-primary transition-colors">
                로그인
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to={`/tenant/${subdomain}/courses`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            강좌 목록으로
          </Link>
        </Button>

        {/* Course Header */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{getLevelText(course.level)}</Badge>
              {course.categories && (
                <Badge variant="outline">{course.categories.name}</Badge>
              )}
            </div>
            <h2 className="text-4xl font-bold mb-4">{course.title}</h2>
            <p className="text-lg text-muted-foreground mb-6">{course.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {course.duration_hours > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration_hours}시간</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>20개 차시</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>수료증 발급</span>
              </div>
            </div>
          </div>

          {/* Enrollment Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="text-3xl font-bold text-primary mb-2">
                  {course.price?.toLocaleString()}원
                </div>
                <CardDescription>
                  20차시 동영상 강의 포함
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg" asChild>
                  <Link to="/auth">수강 신청하기</Link>
                </Button>
                <Button className="w-full" size="lg" variant="outline">
                  샘플 강의 보기
                </Button>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">강의 시간</span>
                    <span className="font-medium">{course.duration_hours}시간</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">총 차시</span>
                    <span className="font-medium">20차시</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">난이도</span>
                    <span className="font-medium">{getLevelText(course.level)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">수료증</span>
                    <span className="font-medium">발급 가능</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Video */}
        {previewContent && previewContent.video_url && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">샘플 강의</h3>
            <Card>
              <CardContent className="p-6">
                <VideoPreview 
                  videoUrl={previewContent.video_url}
                  videoProvider={previewContent.video_provider || "youtube"}
                />
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">{previewContent.title}</h4>
                  <p className="text-sm text-muted-foreground">{previewContent.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Course Contents */}
        {courseContents.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">커리큘럼</h3>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {courseContents.map((content, index) => (
                    <div key={content.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{content.title}</h4>
                          {content.duration_minutes > 0 && (
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" />
                              {content.duration_minutes}분
                            </Badge>
                          )}
                        </div>
                        {content.description && (
                          <p className="text-sm text-muted-foreground">{content.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* What You'll Learn */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">이 강좌에서 배울 내용</h3>
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm">IT 기초 개념과 원리 이해</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm">실전 프로젝트 실습</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm">문제 해결 능력 향상</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm">실무 활용 가능한 스킬 습득</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-muted/30 mt-12">
        <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>&copy; 2024 {tenantName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default TenantCourseDetail;