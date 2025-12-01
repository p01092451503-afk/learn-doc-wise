import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, BarChart } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { AtomSpinner } from "@/components/AtomSpinner";

interface Course {
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

const TenantCourses = () => {
  const { tenant, loading: tenantLoading } = useTenant();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  useEffect(() => {
    if (tenant) {
      fetchCourses();
    }
  }, [tenant]);

  const fetchCourses = async () => {
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const getLevelText = (level: string) => {
    switch (level) {
      case "beginner": return "초급";
      case "intermediate": return "중급";
      case "advanced": return "고급";
      default: return level;
    }
  };

  if (tenantLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AtomSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">강좌를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!tenant) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={`/tenant/${tenant.slug}`} className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{tenant.name}</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to={`/tenant/${tenant.slug}`} className="text-sm font-medium hover:text-primary transition-colors">
                홈
              </Link>
              <Link to={`/tenant/${tenant.slug}/courses`} className="text-sm font-medium text-primary">
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
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">전체 강좌</h2>
          <p className="text-muted-foreground">
            총 {filteredCourses.length}개의 강좌를 제공하고 있습니다
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="강좌명 또는 내용으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="난이도 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 난이도</SelectItem>
              <SelectItem value="beginner">초급</SelectItem>
              <SelectItem value="intermediate">중급</SelectItem>
              <SelectItem value="advanced">고급</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg overflow-hidden">
                    {course.thumbnail_url ? (
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BarChart className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {getLevelText(course.level)}
                    </Badge>
                    {course.duration_hours > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration_hours}시간
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{course.title}</CardTitle>
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
        )}
      </div>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-muted/30 mt-12">
        <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>&copy; 2024 {tenant.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default TenantCourses;