import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, Star, TrendingUp, Award, User } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { Chatbot } from "@/components/Chatbot";
import { Session } from "@supabase/supabase-js";

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
}

const PublicMain = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublishedCourses();
    
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 세션 변경 감지
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
      setCourses(data || []);
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
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-xl z-50 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/main" className="flex items-center gap-2">
            <img src={logoIcon} alt="Logo" className="h-12 w-12" />
            <span className="text-2xl font-logo font-bold text-foreground tracking-tight">atomLMS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/main" className="text-foreground hover:text-primary transition-colors">
              홈
            </Link>
            <Link to="/courses" className="text-foreground hover:text-primary transition-colors">
              전체 강좌
            </Link>
            {!session && (
              <Link to="/auth" className="text-foreground hover:text-primary transition-colors">
                로그인
              </Link>
            )}
          </nav>
          {session ? (
            <Button 
              variant="premium" 
              size="default"
              onClick={() => navigate('/student/courses')}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              마이페이지
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="premium" size="default">
                수강 신청
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-foreground leading-tight">
              새로운 배움의 시작,<br />
              <span className="text-gradient">당신의 성장을 응원합니다</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              전문 강사진과 함께하는 체계적인 온라인 교육 과정
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses">
                <Button size="lg" variant="premium" className="gap-2">
                  <BookOpen className="h-5 w-5" />
                  전체 강좌 보기
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">
                  무료 체험하기
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-accent" />
                <span className="text-sm font-semibold text-foreground">5,000+ 수강생</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-accent" />
                <span className="text-sm font-semibold text-foreground">수료증 발급</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-accent" />
                <span className="text-sm font-semibold text-foreground">평점 4.8/5.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
              인기 교육 과정
            </h2>
            <p className="text-lg text-muted-foreground">
              지금 가장 많은 수강생이 선택한 강좌를 만나보세요
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="aspect-video bg-muted rounded-lg mb-4" />
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">아직 등록된 강좌가 없습니다.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {courses.map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`}>
                  <Card className="group overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-video overflow-hidden bg-muted">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          <BookOpen className="h-16 w-16 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={getLevelBadgeVariant(course.level)}>
                          {getLevelText(course.level)}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration_hours}시간</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {course.description || "강좌 설명이 없습니다."}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-foreground">
                          {course.price > 0 ? `₩${course.price.toLocaleString()}` : "무료"}
                        </span>
                        <Button variant="ghost" size="sm" className="group-hover:text-primary">
                          자세히 보기 →
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {courses.length > 0 && (
            <div className="text-center mt-12">
              <Link to="/courses">
                <Button variant="outline" size="lg">
                  전체 강좌 보기
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
              왜 우리 교육원인가요?
            </h2>
            <p className="text-lg text-muted-foreground">
              체계적인 커리큘럼과 전문 강사진이 함께합니다
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<BookOpen className="h-10 w-10" />}
              title="체계적인 커리큘럼"
              description="단계별로 설계된 교육 과정으로 확실한 학습 효과를 제공합니다"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="전문 강사진"
              description="현업 전문가들의 실무 경험을 바탕으로 한 생생한 강의"
            />
            <FeatureCard
              icon={<Award className="h-10 w-10" />}
              title="수료증 발급"
              description="과정 완료 시 공식 수료증을 발급하여 경력에 도움을 드립니다"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center relative overflow-hidden rounded-2xl p-12 border border-primary/20 shadow-elegant">
            <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                지금 바로 시작하세요
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                첫 강좌는 무료로 체험할 수 있습니다
              </p>
              <Link to="/auth">
                <Button size="lg" variant="premium" className="gap-2">
                  <TrendingUp className="h-5 w-5" />
                  무료로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoIcon} alt="Logo" className="h-10 w-10" />
                <span className="text-xl font-logo font-bold">atomLMS</span>
              </div>
              <p className="text-sm text-muted-foreground">
                전문 온라인 교육 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">교육원 소개</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>회사 소개</li>
                <li>강사진 소개</li>
                <li>오시는 길</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">수강 안내</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>수강 신청</li>
                <li>환불 정책</li>
                <li>이용 약관</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">고객 지원</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>자주 묻는 질문</li>
                <li>1:1 문의</li>
                <li>공지사항</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 atomLMS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 챗봇 */}
      <Chatbot userRole="user" />
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

export default PublicMain;
