import { useEffect, useState } from "react";
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
      {/* Simple Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link to="/main" className="flex items-center gap-3">
              <img src={logoIcon} alt="Logo" className="h-8 w-8" />
              <span className="text-lg font-semibold text-foreground">atomLMS</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/courses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                강좌
              </Link>
              {session ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/student/courses')}
                >
                  <User className="h-4 w-4 mr-2" />
                  마이페이지
                </Button>
              ) : (
                <Link to="/auth">
                  <Button variant="default" size="sm">
                    시작하기
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Minimal Hero - Side by Side */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h1 className="text-5xl font-bold mb-6 text-foreground leading-tight">
                배움의 즐거움을<br/>다시 발견하세요
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                간결하고 효과적인 온라인 강좌로<br/>당신의 목표를 이루어보세요
              </p>
              <div className="flex gap-4">
                <Link to="/courses">
                  <Button size="lg" className="gap-2">
                    강좌 둘러보기
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <BookOpen className="h-32 w-32 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses - List Style */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-3 text-foreground">추천 강좌</h2>
            <p className="text-muted-foreground">당신에게 맞는 완벽한 강좌를 찾아보세요</p>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">강좌를 준비중입니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-6 p-6">
                      <div className="sm:w-48 flex-shrink-0">
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                          {course.thumbnail_url || course.videoThumbnail ? (
                            <img
                              src={course.thumbnail_url || course.videoThumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                              <BookOpen className="h-8 w-8 text-primary/40" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {getLevelText(course.level)}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.duration_hours}시간
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {course.description || "강좌 설명이 없습니다."}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-lg font-bold text-foreground">
                            {course.price > 0 ? `₩${course.price.toLocaleString()}` : "무료"}
                          </span>
                          <span className="text-sm text-primary group-hover:gap-2 flex items-center transition-all">
                            자세히 보기
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {courses.length > 0 && (
            <div className="text-center mt-8">
              <Link to="/courses">
                <Button variant="outline">
                  모든 강좌 보기
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              지금 시작하세요
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              무료 체험으로 먼저 경험해보세요
            </p>
            <Link to="/auth">
              <Button size="lg" variant="default">
                무료로 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logoIcon} alt="Logo" className="h-6 w-6" />
              <span className="font-semibold text-sm">atomLMS</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2024 atomLMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MinimalLayout;
