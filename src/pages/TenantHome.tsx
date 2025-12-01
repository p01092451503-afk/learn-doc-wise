import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, TrendingUp, Users } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { AtomSpinner } from "@/components/AtomSpinner";

const TenantHome = () => {
  const { tenant, loading: tenantLoading } = useTenant();
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [customStyles, setCustomStyles] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant) {
      fetchCustomStyles();
      fetchFeaturedCourses();
    }
  }, [tenant]);

  const fetchCustomStyles = async () => {
    if (!tenant) return;
    
    try {
      const { data: settingsData } = await supabase
        .from("tenant_settings")
        .select("custom_styles")
        .eq("tenant_id", tenant.id)
        .single();

      setCustomStyles(settingsData?.custom_styles || {});
    } catch (error) {
      console.error("Error fetching custom styles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedCourses = async () => {
    if (!tenant) return;

    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          categories (name)
        `)
        .eq("tenant_id", tenant.id)
        .eq("status", "published")
        .eq("is_featured", true)
        .limit(3);

      if (error) throw error;
      setFeaturedCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  if (tenantLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AtomSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>기관을 찾을 수 없습니다</CardTitle>
            <CardDescription>
              요청하신 교육기관이 존재하지 않습니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const styles = customStyles;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {styles.logoUrl && (
                <img src={styles.logoUrl} alt={tenant.name} className="h-10 w-auto" />
              )}
              <h1 className="text-2xl font-bold">{styles.brandName || tenant.name}</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link to={`/tenant/${tenant.slug}`} className="text-sm font-medium hover:text-primary transition-colors">
                홈
              </Link>
              <Link to={`/tenant/${tenant.slug}/courses`} className="text-sm font-medium hover:text-primary transition-colors">
                강좌
              </Link>
              <Link to="/auth" className="text-sm font-medium hover:text-primary transition-colors">
                로그인
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-4">
            {styles.targetAudience || "온라인 교육"}
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {styles.heroTitle || "미래를 준비하는 IT 교육"}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {styles.heroSubtitle || "AI, 데이터 분석, 코딩을 쉽고 재미있게 배우세요"}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link to={`/tenant/${tenant.slug}/courses`}>강좌 둘러보기</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">무료 체험하기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">왜 {styles.brandName || tenant.name}를 선택해야 하나요?</h3>
            <p className="text-muted-foreground">{styles.description}</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <CardTitle>체계적인 커리큘럼</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  기초부터 실전까지 단계별로 구성된 20차시 강좌
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <GraduationCap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>전문 강사진</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  현직 IT 전문가들이 직접 가르치는 실무 중심 교육
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>실시간 피드백</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI 기반 학습 분석으로 맞춤형 학습 경로 제공
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>커뮤니티 학습</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  동료 학습자들과 함께 성장하는 온라인 커뮤니티
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">인기 강좌</h3>
              <p className="text-muted-foreground">지금 가장 많은 학생들이 선택한 강좌입니다</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {course.thumbnail_url && (
                      <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
                        <img 
                          src={course.thumbnail_url} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <Badge className="w-fit mb-2">
                      {course.level === 'beginner' ? '초급' : course.level === 'intermediate' ? '중급' : '고급'}
                    </Badge>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-2">
                      {course.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {course.price?.toLocaleString()}원
                      </span>
                      <Button asChild>
                        <Link to={`/tenant/${tenant.slug}/courses/${course.slug}`}>
                          자세히 보기
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <Link to={`/tenant/${tenant.slug}/courses`}>
                  모든 강좌 보기
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-none">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">지금 바로 시작하세요!</CardTitle>
              <CardDescription className="text-lg">
                {styles.targetAudience}을 위한 최고의 IT 교육 플랫폼
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/auth">무료로 시작하기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={`/tenant/${tenant.slug}/courses`}>강좌 둘러보기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>&copy; 2024 {styles.brandName || tenant.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default TenantHome;