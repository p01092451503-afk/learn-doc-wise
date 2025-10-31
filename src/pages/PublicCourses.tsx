import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Search } from "lucide-react";
import logoIcon from "@/assets/logo-icon-refined.png";
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
  videoThumbnail?: string;
}

const PublicCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  useEffect(() => {
    fetchPublishedCourses();
  }, []);

  const fetchPublishedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

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

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

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
            <span className="text-2xl font-atom font-bold tracking-tight">
              <span className="text-gradient-atom">atom</span>
              <span className="text-deep-navy dark:text-foreground">LMS</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/main" className="text-foreground hover:text-primary transition-colors">
              홈
            </Link>
            <Link to="/courses" className="text-foreground hover:text-primary transition-colors font-semibold">
              전체 강좌
            </Link>
            <Link to="/auth" className="text-foreground hover:text-primary transition-colors">
              로그인
            </Link>
          </nav>
          <Link to="/auth">
            <Button variant="premium" size="default">
              수강 신청
            </Button>
          </Link>
        </div>
      </header>

      {/* Page Header */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-center">
            전체 <span className="text-gradient">교육 과정</span>
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-8">
            원하는 강좌를 찾아 지금 바로 시작하세요
          </p>

          {/* Filters */}
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="강좌 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="aspect-video bg-muted rounded-lg mb-4" />
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground">다른 검색어나 필터를 시도해보세요</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-muted-foreground">
                총 <span className="font-semibold text-foreground">{filteredCourses.length}</span>개의 강좌
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
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
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
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
    </div>
  );
};

export default PublicCourses;
