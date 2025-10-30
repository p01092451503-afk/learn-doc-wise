import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, Zap, Target, User, Menu } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { Session } from "@supabase/supabase-js";
import { getVideoThumbnail } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  price: number;
  level: string;
  duration_hours: number;
  status: string;
  instructor_id: string;
  videoThumbnail?: string;
}

const CardLayout = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublishedCourses();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPublishedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      
      const coursesWithThumbnails = await Promise.all(
        (data || []).map(async (course) => {
          if (!course.thumbnail_url) {
            const { data: contents } = await supabase
              .from("course_contents")
              .select("video_url, video_provider")
              .eq("course_id", course.id)
              .eq("is_published", true)
              .order("order_index", { ascending: true })
              .limit(1);
            
            if (contents && contents.length > 0) {
              const thumbnail = getVideoThumbnail(contents[0].video_url, contents[0].video_provider);
              return { ...course, videoThumbnail: thumbnail };
            }
          }
          return course;
        })
      );
      
      setCourses(coursesWithThumbnails);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/main" className="flex items-center gap-2">
              <img src={logoIcon} alt="Logo" className="h-8 w-8" />
              <span className="font-bold text-lg">atomLMS</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/main" className="text-sm hover:text-primary transition-colors">홈</Link>
              <Link to="/courses" className="text-sm hover:text-primary transition-colors">강좌</Link>
              {!session && (
                <Link to="/auth" className="text-sm hover:text-primary transition-colors">로그인</Link>
              )}
            </nav>
            {session ? (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/student/courses')}
              >
                <User className="h-4 w-4 mr-2" />
                마이페이지
              </Button>
            ) : (
              <Link to="/auth">
                <Button size="sm">시작하기</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Card-based Hero */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden border-2 shadow-xl">
              <div className="grid md:grid-cols-2">
                <div className="p-12 flex flex-col justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                  <h1 className="text-4xl font-bold mb-4 text-foreground">
                    실전 중심의<br/>온라인 교육
                  </h1>
                  <p className="text-lg text-muted-foreground mb-6">
                    최고의 강사진과 함께하는 체계적인 커리큘럼
                  </p>
                  <div className="flex gap-3">
                    <Link to="/courses">
                      <Button>강좌 보기</Button>
                    </Link>
                    <Link to="/auth">
                      <Button variant="outline">무료 체험</Button>
                    </Link>
                  </div>
                </div>
                <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 p-12 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <Card className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-semibold">5,000+</p>
                      <p className="text-xs text-muted-foreground">수강생</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-semibold">100+</p>
                      <p className="text-xs text-muted-foreground">강좌</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-semibold">4.8/5.0</p>
                      <p className="text-xs text-muted-foreground">평점</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-semibold">24/7</p>
                      <p className="text-xs text-muted-foreground">수강 가능</p>
                    </Card>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Courses Grid with Cards */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4">인기 강좌</Badge>
              <h2 className="text-3xl font-bold mb-3 text-foreground">
                지금 가장 핫한 강좌
              </h2>
              <p className="text-muted-foreground">
                수강생들이 선택한 베스트 강좌를 만나보세요
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="aspect-video bg-muted rounded-lg mb-4" />
                    <div className="h-6 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </Card>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">등록된 강좌가 없습니다.</p>
                </div>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Link key={course.id} to={`/courses/${course.id}`}>
                    <Card className="group h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                      <div className="aspect-video overflow-hidden">
                        {course.thumbnail_url || course.videoThumbnail ? (
                          <img
                            src={course.thumbnail_url || course.videoThumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                            <BookOpen className="h-12 w-12 text-primary/40" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {getLevelText(course.level)}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.duration_hours}h
                          </span>
                        </div>
                        <h3 className="font-semibold mb-2 text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {course.description || "강좌 설명이 없습니다."}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="font-bold text-lg text-foreground">
                            {course.price > 0 ? `₩${course.price.toLocaleString()}` : "무료"}
                          </span>
                          <span className="text-xs text-primary group-hover:underline">
                            상세보기 →
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {courses.length > 0 && (
              <div className="text-center mt-10">
                <Link to="/courses">
                  <Button size="lg" variant="outline">
                    전체 강좌 보기
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              왜 atomLMS인가요?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">빠른 학습</h3>
                <p className="text-sm text-muted-foreground">
                  효율적인 커리큘럼으로 빠르게 실력을 향상시킬 수 있습니다
                </p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">전문 강사</h3>
                <p className="text-sm text-muted-foreground">
                  업계 최고의 전문가들이 직접 강의합니다
                </p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">목표 달성</h3>
                <p className="text-sm text-muted-foreground">
                  체계적인 학습 관리로 목표를 확실하게 달성합니다
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Card */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden border-2">
              <div className="p-12 text-center bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
                <h2 className="text-3xl font-bold mb-4 text-foreground">
                  오늘부터 시작하세요
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  첫 강좌 무료 체험 기회를 놓치지 마세요
                </p>
                <Link to="/auth">
                  <Button size="lg">
                    지금 무료로 시작하기
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Compact Footer */}
      <footer className="border-t py-8 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <img src={logoIcon} alt="Logo" className="h-8 w-8" />
                <span className="font-bold">atomLMS</span>
              </div>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">소개</a>
                <a href="#" className="hover:text-foreground transition-colors">강좌</a>
                <a href="#" className="hover:text-foreground transition-colors">문의</a>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 atomLMS
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CardLayout;
