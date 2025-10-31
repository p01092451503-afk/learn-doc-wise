import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, Zap, Target, User, TrendingUp, ArrowRight } from "lucide-react";
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
      {/* Compact Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link to="/main" className="flex items-center gap-2 font-atom font-bold">
              <img src={logoIcon} alt="Logo" className="h-6 w-6" />
              <span>
                <span className="text-gradient-atom">atom</span>
                <span>LMS</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link to="/main" className="hover:text-primary transition-colors">홈</Link>
              <Link to="/courses" className="hover:text-primary transition-colors">강좌</Link>
            </nav>
            {session ? (
              <Button size="sm" variant="ghost" onClick={() => navigate('/student/courses')}>
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">내 강좌</span>
              </Button>
            ) : (
              <Link to="/auth">
                <Button size="sm">시작</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Magazine-Style Hero */}
      <section className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Large Featured Card */}
              <div className="lg:col-span-8 lg:row-span-2">
                <Card className="h-full overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500">
                  <div className="relative h-full min-h-[600px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/30" />
                    <div className="absolute inset-0 flex items-end p-12">
                      <div className="relative z-10">
                        <Badge className="mb-6">특별 추천</Badge>
                        <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 text-white leading-tight">
                          AI와 함께<br/>
                          성장하세요
                        </h1>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl">
                          최신 인공지능 기술을 활용한 차세대 학습 경험
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <Link to="/courses">
                            <Button size="lg" variant="secondary" className="gap-2">
                              <BookOpen className="h-5 w-5" />
                              강좌 탐색
                            </Button>
                          </Link>
                          <Link to="/auth">
                            <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                              무료 시작
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Stats Cards */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="h-10 w-10 text-primary" />
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1">5,000+</div>
                  <div className="text-sm text-muted-foreground">활성 수강생</div>
                </Card>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <Target className="h-10 w-10 text-primary" />
                    <div className="text-lg font-bold">4.9★</div>
                  </div>
                  <div className="text-3xl font-bold mb-1">98%</div>
                  <div className="text-sm text-muted-foreground">만족도</div>
                </Card>
              </div>

              <div className="lg:col-span-4">
                <Card className="p-8 hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-accent/5">
                  <Zap className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">실시간 학습</h3>
                  <p className="text-sm text-muted-foreground">
                    24시간 언제 어디서나 접속 가능
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Masonry Grid Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <Badge className="mb-3">인기 강좌</Badge>
                <h2 className="text-4xl font-bold">
                  트렌딩 코스
                </h2>
              </div>
              <Link to="/courses">
                <Button variant="outline" className="gap-2">
                  전체 보기
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="aspect-video bg-muted rounded-lg mb-4" />
                    <div className="h-6 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </Card>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <Card className="p-20">
                <div className="text-center">
                  <BookOpen className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-xl font-semibold mb-2">곧 새로운 강좌가 출시됩니다</h3>
                  <p className="text-muted-foreground">최신 강좌를 준비중입니다</p>
                </div>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
                {courses.map((course, index) => {
                  // 비대칭 레이아웃을 위한 클래스
                  const isLarge = index % 5 === 0;
                  const isMedium = index % 3 === 0 && !isLarge;
                  
                  return (
                    <Link 
                      key={course.id} 
                      to={`/courses/${course.id}`}
                      className={`${isLarge ? 'sm:col-span-2 lg:row-span-2' : isMedium ? 'sm:col-span-2' : ''}`}
                    >
                      <Card className="group h-full overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className={`relative overflow-hidden ${isLarge ? 'aspect-[16/10]' : 'aspect-video'}`}>
                          {course.thumbnail_url || course.videoThumbnail ? (
                            <img
                              src={course.thumbnail_url || course.videoThumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                              <BookOpen className={`${isLarge ? 'h-20 w-20' : 'h-12 w-12'} text-primary/40`} />
                            </div>
                          )}
                          <div className="absolute top-4 right-4">
                            <Badge variant="secondary">
                              {getLevelText(course.level)}
                            </Badge>
                          </div>
                        </div>
                        <div className={`p-${isLarge ? '8' : '6'}`}>
                          <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{course.duration_hours}시간</span>
                          </div>
                          <h3 className={`${isLarge ? 'text-2xl' : 'text-lg'} font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2`}>
                            {course.title}
                          </h3>
                          <p className={`text-sm text-muted-foreground mb-4 ${isLarge ? 'line-clamp-3' : 'line-clamp-2'}`}>
                            {course.description || "강좌 설명"}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t">
                            <span className={`${isLarge ? 'text-2xl' : 'text-xl'} font-bold`}>
                              {course.price > 0 ? `₩${course.price.toLocaleString()}` : "무료"}
                            </span>
                            <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-2 transition-transform" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">특별한 학습 경험</h2>
              <p className="text-lg text-muted-foreground">
                atomLMS만의 차별화된 기능들
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-8 hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">빠른 학습</h3>
                <p className="text-muted-foreground">
                  최적화된 커리큘럼으로 효율적인 학습이 가능합니다
                </p>
              </Card>
              <Card className="p-8 hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">전문 강사</h3>
                <p className="text-muted-foreground">
                  업계 최고의 전문가들이 직접 가르칩니다
                </p>
              </Card>
              <Card className="p-8 hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">목표 달성</h3>
                <p className="text-muted-foreground">
                  체계적인 관리로 확실한 성과를 보장합니다
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Bold CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden border-2 hover:shadow-2xl transition-shadow">
              <div className="grid md:grid-cols-2">
                <div className="p-12 md:p-16 flex flex-col justify-center">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    지금<br/>시작하세요
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    14일 무료 체험으로 모든 강좌를 경험해보세요
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/auth">
                      <Button size="lg" className="w-full sm:w-auto">
                        무료로 시작하기
                      </Button>
                    </Link>
                    <Link to="/courses">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto">
                        강좌 둘러보기
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground mt-6">
                    신용카드 등록 불필요 • 언제든 취소 가능
                  </p>
                </div>
                <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 p-12 flex items-center justify-center min-h-[400px]">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                  <div className="relative grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="h-20 w-20 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg" />
                      <div className="h-32 w-20 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg" />
                    </div>
                    <div className="space-y-4 mt-8">
                      <div className="h-28 w-20 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg" />
                      <div className="h-24 w-20 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <img src={logoIcon} alt="Logo" className="h-10 w-10" />
                  <span className="text-xl font-bold">atomLMS</span>
                </div>
                <p className="text-sm text-muted-foreground max-w-sm">
                  차세대 온라인 학습 플랫폼으로 당신의 성장을 가속화합니다
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm">강좌</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>전체 강좌</li>
                  <li>인기 강좌</li>
                  <li>신규 강좌</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm">회사</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>소개</li>
                  <li>고객센터</li>
                  <li>이용약관</li>
                </ul>
              </div>
            </div>
            <div className="border-t pt-8 text-center text-xs text-muted-foreground">
              © 2024 atomLMS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CardLayout;
