import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Users, PlayCircle, CheckCircle, ArrowLeft, Star } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import VideoPreview from "@/components/video/VideoPreview";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  price: number;
  level: string;
  duration_hours: number;
  status: string;
}

interface CourseContent {
  id: string;
  title: string;
  description: string;
  video_url: string;
  video_provider: string;
  duration_minutes: number;
  order_index: number;
  is_preview: boolean;
  content_type: string;
}

const PublicCourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
      fetchCourseContents();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseContents = async () => {
    try {
      const { data, error } = await supabase
        .from("course_contents")
        .select("*")
        .eq("course_id", id)
        .eq("is_published", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error("Error fetching course contents:", error);
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

  const previewContent = contents.find(c => c.is_preview);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-muted rounded mx-auto mb-4" />
          <div className="h-4 w-32 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">강좌를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-6">요청하신 강좌가 존재하지 않거나 비공개 상태입니다</p>
          <Link to="/courses">
            <Button variant="outline">강좌 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-xl z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/main" className="flex items-center gap-2">
            <img src={logoIcon} alt="Logo" className="h-12 w-12" />
            <span className="text-2xl font-logo font-bold tracking-tight">
              <span className="text-gradient-slate">atom</span>
              <span className="text-foreground">LMS</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 text-white text-xs font-bold shadow-lg border border-slate-500/30">
              AI
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/main" className="text-foreground hover:text-primary transition-colors">
              홈
            </Link>
            <Link to="/courses" className="text-foreground hover:text-primary transition-colors">
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

      {/* Back Button */}
      <div className="container mx-auto px-4 py-3">
        <Link to="/courses">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            강좌 목록으로
          </Button>
        </Link>
      </div>

      {/* Course Header */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <Badge variant="default" className="text-sm px-3 py-1">{getLevelText(course.level)}</Badge>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration_hours}시간</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <PlayCircle className="h-4 w-4" />
                  <span>{contents.length}개 차시</span>
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-5 text-foreground leading-tight">
                  {course.title}
                </h1>
                <div className="bg-background/60 backdrop-blur-sm rounded-xl p-5 border border-border/50 mb-5">
                  <p className="text-base md:text-lg text-foreground/90 leading-relaxed font-medium">
                    {course.description || "강좌 설명이 없습니다."}
                  </p>
                </div>
                
                {/* 학습 목표/혜택 섹션 */}
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">실무 중심 교육</h4>
                      <p className="text-xs text-muted-foreground">현장에서 바로 활용 가능한 실전 스킬</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">체계적 커리큘럼</h4>
                      <p className="text-xs text-muted-foreground">기초부터 심화까지 단계별 학습</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">전문가 피드백</h4>
                      <p className="text-xs text-muted-foreground">강사의 1:1 맞춤 피드백 제공</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">평생 수강</h4>
                      <p className="text-xs text-muted-foreground">기간 제한 없이 반복 학습 가능</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 pt-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent fill-accent" />
                  <span className="font-semibold text-lg">4.8</span>
                  <span className="text-sm text-muted-foreground">(245명 평가)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">1,234명 수강 중</span>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-20 shadow-elegant">
                {previewContent && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">미리보기</p>
                    <VideoPreview
                      videoUrl={previewContent.video_url}
                      videoProvider={previewContent.video_provider as "youtube" | "vimeo"}
                    />
                  </div>
                )}
                <div className="text-center mb-6 py-4 border-y">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {course.price > 0 ? `₩${course.price.toLocaleString()}` : "무료"}
                  </div>
                  {course.price > 0 && (
                    <p className="text-sm text-muted-foreground">부가세 포함</p>
                  )}
                </div>
                <Link to="/auth" className="block">
                  <Button variant="premium" size="default" className="w-full mb-3">
                    지금 수강 신청하기
                  </Button>
                </Link>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>평생 소장</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>모바일 시청 가능</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>수료증 발급</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Details */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <Tabs defaultValue="curriculum" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="curriculum">커리큘럼</TabsTrigger>
                  <TabsTrigger value="instructor">강사 소개</TabsTrigger>
                  <TabsTrigger value="policy">환불 안내</TabsTrigger>
                </TabsList>

              <TabsContent value="curriculum" className="mt-4">
                <Card className="p-5">
                  <h3 className="text-lg font-semibold mb-3">강좌 커리큘럼</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    총 {contents.length}개 차시 · {course.duration_hours}시간
                  </p>
                  <div className="space-y-2">
                    {contents.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">
                        아직 등록된 차시가 없습니다.
                      </p>
                    ) : (
                      contents.map((content, index) => (
                        <div key={content.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-0.5">{content.title}</h4>
                              {content.description && (
                                <p className="text-sm text-muted-foreground">{content.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {content.is_preview && (
                              <Badge variant="outline" className="text-xs px-2 py-0">미리보기</Badge>
                            )}
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {content.duration_minutes}분
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="instructor" className="mt-4">
                <Card className="p-5">
                  <h3 className="text-lg font-semibold mb-3">강사 소개</h3>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold">
                      A
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">전문 강사진</h4>
                      <p className="text-sm text-muted-foreground">
                        10년 이상의 실무 경험을 바탕으로 체계적인 교육을 제공합니다.
                      </p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-semibold mb-3">경력 사항</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• 현재 주요 IT 기업 시니어 개발자</li>
                      <li>• 다수의 프로젝트 리딩 경험</li>
                      <li>• 5,000명 이상의 수강생 배출</li>
                    </ul>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="policy" className="mt-4">
                <Card className="p-5">
                  <h3 className="text-lg font-semibold mb-3">환불 및 배송 안내</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">환불 정책</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• 수강 시작 전: 100% 환불</li>
                        <li>• 수강 진도 10% 미만: 90% 환불</li>
                        <li>• 수강 진도 10% 이상 30% 미만: 70% 환불</li>
                        <li>• 수강 진도 30% 이상: 환불 불가</li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3">이용 안내</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• 강좌는 결제 즉시 수강 가능합니다</li>
                        <li>• 평생 소장하여 언제든 시청 가능합니다</li>
                        <li>• PC, 모바일, 태블릿 모든 기기에서 시청 가능합니다</li>
                        <li>• 수료증은 강좌 완료 시 자동 발급됩니다</li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3">문의 사항</h4>
                      <p className="text-sm text-muted-foreground">
                        기타 문의사항은 고객센터를 통해 문의해주시기 바랍니다.
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Spacer for right column alignment */}
          <div className="hidden lg:block lg:col-span-1" />
        </div>
      </div>
    </section>

      {/* Footer */}
      <footer className="border-t py-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center text-xs text-muted-foreground">
            <p>© 2024 atomLMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicCourseDetail;
