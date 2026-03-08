import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, ArrowRight, User, Search } from "lucide-react";
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

const MinimalLayout = () => {
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
        .limit(4);

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
      toast.error("강좌 목록을 불러오는 데 실패했습니다.");
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
    <div className="min-h-screen flex">
      {/* Fixed Sidebar Navigation */}
      <aside className="w-64 border-r bg-card flex-shrink-0 sticky top-0 h-screen hidden lg:flex flex-col">
        <div className="p-6 border-b">
          <Link to="/main" className="flex items-center gap-3 mb-8">
            <img src={logoIcon} alt="Logo" className="h-10 w-10" />
            <div>
              <div className="font-bold text-lg">atomLMS</div>
              <div className="text-xs text-muted-foreground">Learn Simply</div>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <Link to="/main" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">홈</span>
          </Link>
          <Link to="/courses" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors">
            <Search className="h-5 w-5" />
            <span className="text-sm font-medium">강좌 탐색</span>
          </Link>
          {session ? (
            <button 
              onClick={() => navigate('/student/courses')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">마이페이지</span>
            </button>
          ) : (
            <Link to="/auth" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">로그인</span>
            </Link>
          )}
        </nav>

        <div className="p-6 border-t">
          {!session && (
            <Link to="/auth" className="block">
              <Button className="w-full" size="sm">
                무료 시작하기
              </Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="lg:hidden border-b bg-background sticky top-0 z-40">
          <div className="px-4 py-4 flex items-center justify-between">
            <Link to="/main" className="flex items-center gap-2">
              <img src={logoIcon} alt="Logo" className="h-8 w-8" />
              <span className="font-bold">atomLMS</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/courses">
                <Button variant="ghost" size="sm">강좌</Button>
              </Link>
              {session ? (
                <Button size="sm" onClick={() => navigate('/student/courses')}>
                  <User className="h-4 w-4" />
                </Button>
              ) : (
                <Link to="/auth">
                  <Button size="sm">시작</Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Side-by-Side Hero Section */}
        <section className="min-h-[80vh] flex items-center">
          <div className="container mx-auto px-6 lg:px-12 py-20">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7">
                <div className="inline-block mb-6">
                  <Badge variant="outline" className="text-sm py-1">
                    심플하고 효과적인 학습
                  </Badge>
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-[1.1]">
                  집중할 수 있는<br/>
                  <span className="text-muted-foreground">공간</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl">
                  불필요한 것은 모두 제거했습니다.<br/>
                  오직 학습에만 몰입하세요.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/courses">
                    <Button size="lg" className="gap-2">
                      강좌 둘러보기
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="relative">
                  <div className="aspect-square rounded-3xl bg-gradient-to-br from-muted to-muted/30 p-12">
                    <div className="w-full h-full rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
                      <div className="text-center">
                        <BookOpen className="h-20 w-20 text-muted-foreground/40 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">Learn. Focus. Succeed.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Two Column Course List */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-5xl mx-auto">
              <div className="mb-16">
                <h2 className="text-4xl font-bold mb-4">추천 강좌</h2>
                <p className="text-lg text-muted-foreground">
                  엄선된 강좌로 시작하세요
                </p>
              </div>

              {loading ? (
                <div className="space-y-8">
                  {[1, 2].map((i) => (
                    <div key={i} className="grid md:grid-cols-2 gap-8">
                      <Card className="p-6 animate-pulse">
                        <div className="h-48 bg-muted rounded-lg mb-4" />
                        <div className="h-6 bg-muted rounded mb-2" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </Card>
                      <Card className="p-6 animate-pulse">
                        <div className="h-48 bg-muted rounded-lg mb-4" />
                        <div className="h-6 bg-muted rounded mb-2" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </Card>
                    </div>
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-20">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">강좌를 준비중입니다</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {courses.map((course, index) => (
                    <Link key={course.id} to={`/courses/${course.id}`}>
                      <div className={`group grid md:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                        <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                            {course.thumbnail_url || course.videoThumbnail ? (
                              <img
                                src={course.thumbnail_url || course.videoThumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                                <BookOpen className="h-16 w-16 text-primary/30" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                          <div className="flex items-center gap-3 mb-4">
                            <Badge variant="outline">
                              {getLevelText(course.level)}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {course.duration_hours}시간
                            </span>
                          </div>
                          <h3 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-lg text-muted-foreground mb-6 line-clamp-3">
                            {course.description || "강좌 설명이 없습니다."}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                              {course.price > 0 ? `₩${course.price.toLocaleString()}` : "무료"}
                            </span>
                            <span className="flex items-center gap-2 text-primary font-medium">
                              자세히 보기
                              <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {courses.length > 0 && (
                <div className="mt-16 text-center">
                  <Link to="/courses">
                    <Button size="lg" variant="outline">
                      모든 강좌 보기
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Centered CTA */}
        <section className="py-32">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-5xl font-bold mb-6">
                단순함의 힘을<br/>경험하세요
              </h2>
              <p className="text-xl text-muted-foreground mb-10">
                복잡함은 버리고, 효과만 남겼습니다
              </p>
              <Link to="/auth">
                <Button size="lg">
                  지금 무료로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Simple Footer */}
        <footer className="border-t py-12">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <img src={logoIcon} alt="Logo" className="h-8 w-8" />
                  <div>
                    <div className="font-bold">atomLMS</div>
                    <div className="text-xs text-muted-foreground">Learn Simply</div>
                  </div>
                </div>
                <div className="flex gap-8 text-sm text-muted-foreground">
                  <Link to="#" className="hover:text-foreground transition-colors">소개</Link>
                  <Link to="#" className="hover:text-foreground transition-colors">강좌</Link>
                  <Link to="#" className="hover:text-foreground transition-colors">고객지원</Link>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                © 2024 atomLMS. 모든 권리 보유.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MinimalLayout;
