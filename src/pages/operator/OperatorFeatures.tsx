import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Users,
  GraduationCap,
  BarChart3,
  Award,
  MessageSquare,
  FileText,
  Calendar,
  Settings,
  CreditCard,
  Video,
  Brain,
  TrendingUp,
  CheckCircle,
  Shield,
} from "lucide-react";

interface Feature {
  name: string;
  description: string;
  icon: any;
  category: string;
}

const OperatorFeatures = () => {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("operator-theme");
    return (saved as "dark" | "light") || "dark";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("operator-theme");
      setTheme((saved as "dark" | "light") || "dark");
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const saved = localStorage.getItem("operator-theme");
      if (saved !== theme) {
        setTheme((saved as "dark" | "light") || "dark");
      }
    }, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  const studentFeatures: Feature[] = [
    {
      name: "대시보드",
      description: "학습 진행 상황, 다가오는 과제, 최근 성적을 한눈에 확인",
      icon: BarChart3,
      category: "core",
    },
    {
      name: "강의 관리",
      description: "등록된 강의 목록, 강의 상세 정보, 학습 자료 접근",
      icon: BookOpen,
      category: "core",
    },
    {
      name: "과제 제출",
      description: "과제 목록 확인, 제출, AI 자동 채점 기능",
      icon: FileText,
      category: "core",
    },
    {
      name: "학습 경로",
      description: "개인화된 학습 로드맵 및 추천 강의",
      icon: TrendingUp,
      category: "learning",
    },
    {
      name: "게임화 요소",
      description: "포인트, 배지, 리더보드를 통한 학습 동기 부여",
      icon: Award,
      category: "engagement",
    },
    {
      name: "학습 분석",
      description: "개인 학습 통계, 진도율, 성적 추이 분석",
      icon: BarChart3,
      category: "analytics",
    },
    {
      name: "커뮤니티",
      description: "학생 간 질문답변, 스터디 그룹 형성",
      icon: MessageSquare,
      category: "social",
    },
    {
      name: "AI 튜터",
      description: "학습 내용에 대한 AI 기반 질의응답 및 피드백",
      icon: Brain,
      category: "ai",
    },
  ];

  const teacherFeatures: Feature[] = [
    {
      name: "강의 관리",
      description: "강의 생성, 수정, 삭제 및 커리큘럼 구성",
      icon: BookOpen,
      category: "core",
    },
    {
      name: "학생 관리",
      description: "수강생 목록, 출석 관리, 성적 조회",
      icon: Users,
      category: "core",
    },
    {
      name: "과제 관리",
      description: "과제 생성, AI 자동 채점, 피드백 제공",
      icon: FileText,
      category: "core",
    },
    {
      name: "출석 체크",
      description: "실시간 출석 체크 및 출석률 통계",
      icon: CheckCircle,
      category: "management",
    },
    {
      name: "수익 관리",
      description: "강의별 수익 현황, 정산 내역 확인",
      icon: CreditCard,
      category: "finance",
    },
    {
      name: "학습 분석",
      description: "학생별/강의별 학습 데이터 분석 및 리포트",
      icon: BarChart3,
      category: "analytics",
    },
    {
      name: "비디오 관리",
      description: "강의 영상 업로드, 스트리밍, 관리",
      icon: Video,
      category: "content",
    },
    {
      name: "AI 지원",
      description: "AI 기반 과제 채점, 피드백 생성",
      icon: Brain,
      category: "ai",
    },
  ];

  const adminFeatures: Feature[] = [
    {
      name: "전체 대시보드",
      description: "플랫폼 전체 통계, KPI, 실시간 모니터링",
      icon: BarChart3,
      category: "core",
    },
    {
      name: "사용자 관리",
      description: "학생, 강사 계정 관리 및 권한 설정",
      icon: Users,
      category: "core",
    },
    {
      name: "강의 승인",
      description: "강사가 생성한 강의 검토 및 승인",
      icon: CheckCircle,
      category: "management",
    },
    {
      name: "콘텐츠 관리",
      description: "공지사항, FAQ, 템플릿 관리",
      icon: FileText,
      category: "content",
    },
    {
      name: "수익 관리",
      description: "전체 매출 분석, 정산 처리, 결제 관리",
      icon: CreditCard,
      category: "finance",
    },
    {
      name: "분석 도구",
      description: "사용자 행동 분석, 학습 패턴, 성과 지표",
      icon: TrendingUp,
      category: "analytics",
    },
    {
      name: "시스템 설정",
      description: "플랫폼 전체 설정, 메뉴 순서, 테마 관리",
      icon: Settings,
      category: "system",
    },
    {
      name: "AI 로그",
      description: "AI 사용 현황, 토큰 소비량 모니터링",
      icon: Brain,
      category: "ai",
    },
    {
      name: "스토리지 관리",
      description: "파일 저장소 사용량 및 용량 관리",
      icon: Shield,
      category: "system",
    },
  ];

  const renderFeatureCard = (feature: Feature) => (
    <Card
      key={feature.name}
      className={cn(
        "transition-colors hover:shadow-lg",
        theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-300"
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <feature.icon className="h-5 w-5 text-violet-400" />
            </div>
            <CardTitle
              className={cn(
                "text-lg transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}
            >
              {feature.name}
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {feature.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-sm transition-colors",
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          )}
        >
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div>
          <h1
            className={cn(
              "text-3xl font-bold mb-2 transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}
          >
            기능 목록
          </h1>
          <p
            className={cn(
              "transition-colors",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}
          >
            학생, 강사, 관리자 모드의 모든 기능을 확인합니다
          </p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList
            className={cn(
              "grid w-full grid-cols-3 transition-colors",
              theme === "dark" ? "bg-slate-900/50" : "bg-slate-100"
            )}
          >
            <TabsTrigger value="student">
              <GraduationCap className="h-4 w-4 mr-2" />
              학생
            </TabsTrigger>
            <TabsTrigger value="teacher">
              <Users className="h-4 w-4 mr-2" />
              강사
            </TabsTrigger>
            <TabsTrigger value="admin">
              <Shield className="h-4 w-4 mr-2" />
              관리자
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {studentFeatures.map(renderFeatureCard)}
            </div>
          </TabsContent>

          <TabsContent value="teacher" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teacherFeatures.map(renderFeatureCard)}
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {adminFeatures.map(renderFeatureCard)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OperatorLayout>
  );
};

export default OperatorFeatures;
