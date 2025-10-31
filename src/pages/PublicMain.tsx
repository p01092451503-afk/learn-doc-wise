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
import { AISearchBar } from "@/components/AISearchBar";
import { getVideoThumbnail } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/i18n/translations";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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

const PublicMain = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

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
      
      // 각 코스의 첫 번째 콘텐츠에서 비디오 썸네일 추출
      const coursesWithThumbnails = await Promise.all(
        (data || []).map(async (course) => {
          if (!course.thumbnail_url) {
            // 첫 번째 콘텐츠 가져오기
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
      case "beginner": return t("beginner");
      case "intermediate": return t("intermediate");
      case "advanced": return t("advanced");
      default: return level;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-xl z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          {/* Top Row - Logo and Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Link to="/main" className="flex items-center gap-2">
              <img src={logoIcon} alt="Logo" className="h-10 w-10 md:h-12 md:w-12" />
              <span className="text-xl md:text-2xl font-logo font-bold tracking-tight">
                <span className="text-gradient-slate">atom</span>
                <span className="text-foreground">LMS</span>
              </span>
              <span className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-gradient-to-br from-primary via-primary-glow to-accent text-primary-foreground text-[10px] md:text-xs font-bold shadow-glow border border-primary/20">
                AI
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/main" className="text-lg font-display font-bold text-foreground hover:text-primary transition-all hover:scale-105">
                {t('home')}
              </Link>
              <Link to="/courses" className="text-lg font-display font-bold text-foreground hover:text-primary transition-all hover:scale-105">
                {t('allCourses')}
              </Link>
              {!session && (
                <Link to="/auth" className="text-lg font-display font-bold text-foreground hover:text-primary transition-all hover:scale-105">
                  {t('login')}
                </Link>
              )}
            </nav>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {session ? (
                <Button 
                  variant="premium" 
                  size="default"
                  onClick={() => navigate('/student/courses')}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('myPage')}</span>
                </Button>
              ) : (
                <Link to="/auth">
                  <Button variant="premium" size="default">
                    <span className="hidden sm:inline">{t('signup')}</span>
                    <span className="sm:hidden">{t('signup')}</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          {/* Bottom Row - AI Search Bar */}
          <div className="flex justify-center pb-2">
            <AISearchBar />
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-foreground leading-tight">
              {t('heroTitle')}<br />
              <span className="text-gradient">{t('heroSubtitle')}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              {t('heroDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses">
                <Button size="lg" variant="premium" className="gap-2">
                  <BookOpen className="h-5 w-5" />
                  {t('viewAllCourses')}
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">
                  {t('freeTrial')}
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-accent" />
                <span className="text-sm font-semibold text-foreground">5,000+ {t('students')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-accent" />
                <span className="text-sm font-semibold text-foreground">{t('certificate')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-accent" />
                <span className="text-sm font-semibold text-foreground">{t('rating')} 4.8/5.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
              {t('popularCourses')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('popularCoursesDesc')}
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
              <p className="text-lg text-muted-foreground">{t('noCoursesYet')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {courses.map((course) => (
                  <Link key={course.id} to={`/courses/${course.id}`}>
                    <Card className="group overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                      <div className="aspect-video overflow-hidden bg-muted">
                        {course.thumbnail_url || course.videoThumbnail ? (
                          <img
                            src={course.thumbnail_url || course.videoThumbnail}
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
                          <span>{course.duration_hours}{t('hours')}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {course.description || t('noCoursesYet')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-foreground">
                          {course.price > 0 ? `₩${course.price.toLocaleString()}` : t('free')}
                        </span>
                        <Button variant="ghost" size="sm" className="group-hover:text-primary">
                          {t('viewDetails')} →
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
                  {t('viewAllCourses')}
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
              {t('whyUs')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('whyUsDesc')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<BookOpen className="h-10 w-10" />}
              title={t('systematicCurriculum')}
              description={t('systematicDesc')}
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title={t('expertInstructors')}
              description={t('expertDesc')}
            />
            <FeatureCard
              icon={<Award className="h-10 w-10" />}
              title={t('certificateIssue')}
              description={t('certificateDesc')}
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
                {t('startNow')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('firstCourseFree')}
              </p>
              <Link to="/auth">
                <Button size="lg" variant="premium" className="gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('startForFree')}
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
              <h4 className="font-semibold mb-4">{t('aboutUs')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t('companyInfo')}</li>
                <li>{t('instructorInfo')}</li>
                <li>{t('directions')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('enrollment')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t('enrollmentInfo')}</li>
                <li>{t('refundPolicy')}</li>
                <li>{t('terms')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('support')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t('faq')}</li>
                <li>{t('contact')}</li>
                <li>{t('notice')}</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 atomLMS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 챗봇 - 숨김 */}
      {/* <Chatbot userRole="user" /> */}
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
