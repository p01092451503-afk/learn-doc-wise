import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, Star, TrendingUp, Award, User, ArrowRight } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { Session } from "@supabase/supabase-js";
import { AISearchBar } from "@/components/AISearchBar";
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

const ModernLayout = () => {
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

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "beginner": return "default";
      case "intermediate": return "secondary";
      case "advanced": return "destructive";
      default: return "outline";
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
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/main" className="flex items-center gap-2">
              <img src={logoIcon} alt="Logo" className="h-12 w-12" />
              <span className="text-2xl font-logo font-bold">
                <span className="text-gradient-slate">atom</span>
                <span>LMS</span>
              </span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 text-white text-xs font-bold shadow-lg border border-slate-500/30">AI</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              <Link to="/main" className="text-sm font-medium hover:text-primary transition-colors">홈</Link>
              <Link to="/courses" className="text-sm font-medium hover:text-primary transition-colors">전체 강좌</Link>
            </nav>
            <div className="flex items-center gap-3">
              <AISearchBar />
              {session ? (
                <Button variant="premium" onClick={() => navigate('/student/courses')} className="gap-2">
                  <User className="h-4 w-4" />
                  마이페이지
                </Button>
              ) : (
                <Link to="/auth">
                  <Button variant="premium">시작하기</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Fullscreen Hero with Overlay Content */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-90" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <Badge className="mb-6 text-sm px-4 py-2">AI 기반 학습 플랫폼</Badge>
          <h1 className="text-6xl md:text-8xl font-display font-bold mb-8 leading-tight">
            미래를 배우는<br/>
            <span className="text-gradient">가장 스마트한 방법</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
            AI 튜터와 함께하는 개인 맞춤형 학습 경험
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/courses">
              <Button size="lg" variant="premium" className="gap-2 text-lg px-8 py-6">
                <BookOpen className="h-5 w-5" />
                강좌 둘러보기
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                무료 체험 시작
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-12 text-sm">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-1">5,000+</div>
              <div className="text-muted-foreground">활성 수강생</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-1">4.9★</div>
              <div className="text-muted-foreground">평균 만족도</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-1">100+</div>
              <div className="text-muted-foreground">전문 강좌</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
          </div>
        </div>
      </section>

      {/* Horizontal Scroll Section - Featured Courses */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <Badge className="mb-4">인기</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold">
                트렌딩 강좌
              </h2>
            </div>
            <Link to="/courses">
              <Button variant="ghost" className="gap-2">
                전체 보기
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="min-w-[400px] p-6 animate-pulse">
                  <div className="aspect-video bg-muted rounded-lg mb-4" />
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">곧 새로운 강좌가 준비됩니다</p>
            </div>
          ) : (
            <div className="flex gap-8 overflow-x-auto pb-6 snap-x">
              {courses.map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`} className="snap-start">
                  <Card className="group min-w-[420px] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {course.thumbnail_url || course.videoThumbnail ? (
                        <img
                          src={course.thumbnail_url || course.videoThumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                          <BookOpen className="h-20 w-20 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="default">
                          {getLevelText(course.level)}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {course.duration_hours}시간
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 line-clamp-2">
                        {course.description || "강좌 설명"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-foreground">
                          {course.price > 0 ? `₩${course.price.toLocaleString()}` : "무료"}
                        </span>
                        <div className="flex items-center gap-2 text-primary">
                          <span className="font-semibold">시작하기</span>
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Split Features Section */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div>
              <Badge className="mb-6">특별한 이유</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">
                왜 atomLMS를<br/>선택해야 할까요?
              </h2>
              <div className="space-y-8">
                <FeatureCard
                  icon={<BookOpen className="h-8 w-8" />}
                  title="AI 맞춤형 학습"
                  description="인공지능이 분석한 당신만의 학습 패턴으로 최적화된 커리큘럼을 제공합니다"
                />
                <FeatureCard
                  icon={<Users className="h-8 w-8" />}
                  title="실시간 멘토링"
                  description="업계 최고의 전문가들이 24/7 실시간으로 질문에 답변해드립니다"
                />
                <FeatureCard
                  icon={<Award className="h-8 w-8" />}
                  title="공인 수료증"
                  description="완료 시 산업계에서 인정받는 공식 수료증을 발급받으세요"
                />
              </div>
            </div>
            <div className="relative h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl" />
              <div className="absolute inset-4 bg-background rounded-3xl shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <Star className="h-32 w-32 text-primary/40 mx-auto mb-6" />
                  <p className="text-xl font-semibold text-muted-foreground">학습 통계 시각화</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Large CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-display font-bold mb-8">
              당신의 미래,<br/>
              지금 시작하세요
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12">
              14일 무료 체험으로 모든 프리미엄 기능을 경험해보세요
            </p>
            <Link to="/auth">
              <Button size="lg" variant="premium" className="text-xl px-12 py-8 gap-3">
                <TrendingUp className="h-6 w-6" />
                무료로 시작하기
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-6">
              신용카드 등록 불필요 • 언제든 취소 가능
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <img src={logoIcon} alt="Logo" className="h-12 w-12" />
                <span className="text-2xl font-logo font-bold">
                  <span className="text-gradient-slate">atom</span>
                  <span>LMS</span>
                </span>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                AI 기반 차세대 온라인 학습 플랫폼으로<br/>당신의 성장을 가속화합니다
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">플랫폼</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>전체 강좌</li>
                <li>학습 경로</li>
                <li>AI 튜터</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">회사</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>소개</li>
                <li>강사 모집</li>
                <li>파트너십</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">지원</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>고객센터</li>
                <li>FAQ</li>
                <li>이용약관</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 atomLMS. 모든 권리 보유.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="group p-6 rounded-xl card-premium border border-border hover:border-primary/50 hover:shadow-premium transition-all duration-300">
      <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default ModernLayout;
