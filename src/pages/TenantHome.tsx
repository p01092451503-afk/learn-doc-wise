import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Users, Brain } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { AtomSpinner } from "@/components/AtomSpinner";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  level: string;
  price: number | null;
  slug: string;
}

const TenantHome = () => {
  const { tenant, loading: tenantLoading } = useTenant();
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [customStyles, setCustomStyles] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Fetch sections dynamically
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ["tenant-sections", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("tenant_sections")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("is_visible", true)
        .order("display_order");

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id,
  });

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
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("status", "published")
        .eq("is_featured", true)
        .limit(3);

      if (error) throw error;
      setFeaturedCourses((data || []) as Course[]);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Show loading state
  if (tenantLoading || sectionsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AtomSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Show error state if no tenant
  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>기관을 찾을 수 없습니다</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">요청하신 교육기관이 존재하지 않습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const styles = customStyles;

  // Render section based on type
  const renderSection = (section: any) => {
    switch (section.section_type) {
      case "hero":
        return (
          <section
            key={section.id}
            className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10"
          >
            <div className="container mx-auto max-w-6xl text-center">
              <Badge variant="secondary" className="mb-4">
                {styles.targetAudience || "온라인 교육"}
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {section.title || "미래를 준비하는 IT 교육"}
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {section.description || "AI, 데이터 분석, 코딩을 쉽고 재미있게 배우세요"}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" asChild>
                  <Link to={`/tenant/${tenant.slug}/courses`}>
                    {section.settings?.buttonText || "강좌 둘러보기"}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/auth">무료 체험하기</Link>
                </Button>
              </div>
            </div>
          </section>
        );

      case "features":
        return (
          <section key={section.id} className="py-20 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold mb-4">
                  {section.title || `왜 ${styles.brandName || tenant.name}를 선택해야 하나요?`}
                </h3>
                <p className="text-muted-foreground">{section.description || styles.description}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <Brain className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>AI 기반 학습</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      인공지능이 분석한 맞춤형 학습 경로와 실시간 피드백
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <GraduationCap className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>실전 프로젝트</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      현업 전문가와 함께하는 실무 중심 프로젝트 경험
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Users className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>커뮤니티 지원</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      동료 학습자 및 멘토와의 활발한 교류와 협업
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        );

      case "courses":
        return featuredCourses.length > 0 ? (
          <section key={section.id} className="py-20 px-4 bg-muted/30">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold mb-4">{section.title || "인기 강좌"}</h3>
                <p className="text-muted-foreground">
                  {section.description || "지금 가장 많은 학생들이 선택한 강좌입니다"}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {featuredCourses.map((course) => (
                  <Link key={course.id} to={`/tenant/${tenant.slug}/courses/${course.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                      {course.thumbnail_url && (
                        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <Badge className="w-fit mb-2">
                          {course.level === "beginner"
                            ? "초급"
                            : course.level === "intermediate"
                            ? "중급"
                            : "고급"}
                        </Badge>
                        <CardTitle className="text-xl line-clamp-2">{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3 mb-4">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between">
                          {course.price && (
                            <span className="text-2xl font-bold text-primary">
                              {course.price.toLocaleString()}원
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button variant="outline" size="lg" asChild>
                  <Link to={`/tenant/${tenant.slug}/courses`}>모든 강좌 보기</Link>
                </Button>
              </div>
            </div>
          </section>
        ) : null;

      case "cta":
        return (
          <section key={section.id} className="py-20 px-4">
            <div className="container mx-auto max-w-4xl">
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-none">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl mb-4">
                    {section.title || "지금 바로 시작하세요!"}
                  </CardTitle>
                  <p className="text-lg text-muted-foreground">
                    {section.description ||
                      `${styles.targetAudience}을 위한 최고의 IT 교육 플랫폼`}
                  </p>
                </CardHeader>
                <CardContent className="flex justify-center gap-4">
                  <Button size="lg" asChild>
                    <Link to="/auth">{section.settings?.buttonText || "무료로 시작하기"}</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to={`/tenant/${tenant.slug}/courses`}>강좌 둘러보기</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

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
              <Link
                to={`/tenant/${tenant.slug}`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                홈
              </Link>
              <Link
                to={`/tenant/${tenant.slug}/courses`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                강좌
              </Link>
              <Link to="/auth" className="text-sm font-medium hover:text-primary transition-colors">
                로그인
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Dynamic Sections */}
      {sections?.map((section) => renderSection(section))}

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
