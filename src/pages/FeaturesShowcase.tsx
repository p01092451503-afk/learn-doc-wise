import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Layout,
  Target,
  LineChart,
  Activity,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
} from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Feature {
  name: string;
  description: string;
  icon: any;
}

interface RoleFeatures {
  role: string;
  tagline: string;
  color: string;
  features: Feature[];
}

const FeaturesShowcase = () => {
  const [activeTab, setActiveTab] = useState("student");

  const rolesData: RoleFeatures[] = [
    {
      role: "student",
      tagline: "학습을 더 스마트하게",
      color: "from-blue-500 to-cyan-500",
      features: [
        {
          name: "대시보드",
          description: "학습 현황을 한눈에 파악하고 목표를 추적하세요",
          icon: Layout,
        },
        {
          name: "강의 관리",
          description: "수강 중인 모든 강의를 체계적으로 관리",
          icon: BookOpen,
        },
        {
          name: "AI 자동 채점",
          description: "즉시 피드백으로 빠른 학습 향상",
          icon: Brain,
        },
        {
          name: "학습 경로",
          description: "개인화된 커리큘럼으로 효율적인 학습",
          icon: Target,
        },
        {
          name: "게임화",
          description: "포인트와 배지로 재미있는 학습 경험",
          icon: Award,
        },
        {
          name: "학습 분석",
          description: "데이터 기반 학습 패턴 분석",
          icon: LineChart,
        },
        {
          name: "커뮤니티",
          description: "동료 학습자와 함께 성장",
          icon: MessageSquare,
        },
        {
          name: "비디오 학습",
          description: "고품질 온라인 강의 스트리밍",
          icon: Video,
        },
      ],
    },
    {
      role: "teacher",
      tagline: "강의를 더 효과적으로",
      color: "from-violet-500 to-purple-500",
      features: [
        {
          name: "강의 관리",
          description: "쉽고 빠른 강의 콘텐츠 제작 및 관리",
          icon: BookOpen,
        },
        {
          name: "학생 관리",
          description: "수강생 진도와 성과를 실시간으로 추적",
          icon: Users,
        },
        {
          name: "AI 과제 채점",
          description: "자동 채점으로 시간 절약, 품질 향상",
          icon: Brain,
        },
        {
          name: "출석 관리",
          description: "간편한 실시간 출석 체크 시스템",
          icon: CheckCircle,
        },
        {
          name: "수익 관리",
          description: "강의 수익과 정산을 투명하게 확인",
          icon: CreditCard,
        },
        {
          name: "학습 분석",
          description: "강의 성과를 데이터로 분석",
          icon: BarChart3,
        },
        {
          name: "비디오 관리",
          description: "강의 영상 업로드 및 스트리밍",
          icon: Video,
        },
        {
          name: "과제 관리",
          description: "효율적인 과제 출제 및 피드백",
          icon: FileText,
        },
      ],
    },
    {
      role: "admin",
      tagline: "플랫폼을 더 강력하게",
      color: "from-orange-500 to-red-500",
      features: [
        {
          name: "통합 대시보드",
          description: "플랫폼 전체 KPI를 한눈에",
          icon: BarChart3,
        },
        {
          name: "사용자 관리",
          description: "모든 회원을 체계적으로 관리",
          icon: Users,
        },
        {
          name: "강의 승인",
          description: "품질 관리를 통한 콘텐츠 큐레이션",
          icon: CheckCircle,
        },
        {
          name: "매출 관리",
          description: "수익 분석 및 정산 처리",
          icon: CreditCard,
        },
        {
          name: "분석 도구",
          description: "데이터 기반 의사결정 지원",
          icon: TrendingUp,
        },
        {
          name: "시스템 모니터링",
          description: "실시간 시스템 상태 추적",
          icon: Activity,
        },
        {
          name: "AI 로그",
          description: "AI 사용 현황 및 비용 관리",
          icon: Brain,
        },
        {
          name: "시스템 설정",
          description: "플랫폼 전체 설정 커스터마이징",
          icon: Settings,
        },
      ],
    },
  ];

  const currentRole = rolesData.find((r) => r.role === activeTab);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Stats Section */}
      <section className="py-12 border-y border-slate-800/50 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "100+", label: "강의 개설" },
              { value: "5,000+", label: "활성 학습자" },
              { value: "98%", label: "만족도" },
              { value: "AI", label: "자동 채점" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
              모든 역할을 위한 완벽한 기능
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              학생, 강사, 관리자 각각의 니즈에 맞춘 전문 기능을 제공합니다
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-slate-800/50 mb-6">
              <TabsTrigger value="student" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                <GraduationCap className="h-4 w-4 mr-2" />
                학생
              </TabsTrigger>
              <TabsTrigger value="teacher" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">
                <Users className="h-4 w-4 mr-2" />
                강사
              </TabsTrigger>
              <TabsTrigger value="admin" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
                <Shield className="h-4 w-4 mr-2" />
                관리자
              </TabsTrigger>
            </TabsList>

            {rolesData.map((roleData) => (
              <TabsContent key={roleData.role} value={roleData.role} className="animate-fade-in">
                <div className="text-center mb-3">
                  <div className={`inline-block px-6 py-3 rounded-full bg-gradient-to-r ${roleData.color} mb-2`}>
                    <Zap className="h-6 w-6 text-white inline-block" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{roleData.tagline}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {roleData.features.map((feature, index) => (
                    <Card
                      key={index}
                      className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/20 animate-fade-in group"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader className="pb-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${roleData.color} w-fit mb-3 group-hover:scale-110 transition-transform`}>
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-lg text-white">{feature.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-400">{feature.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* AI Features Highlight */}
      <section className="py-20 px-4 bg-gradient-to-r from-violet-900/20 to-purple-900/20 border-y border-violet-500/20">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-6">
            <Brain className="h-5 w-5 text-violet-400" />
            <span className="text-violet-400 font-medium">AI Powered</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            AI가 만드는 차별화된 학습 경험
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
            최신 AI 기술로 자동 채점, 맞춤형 피드백, 학습 분석까지
            <br />
            교육의 모든 과정을 스마트하게 혁신합니다
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Zap, title: "즉시 채점", desc: "AI 자동 채점으로 실시간 피드백" },
              { icon: Target, title: "맞춤 학습", desc: "개인별 최적화된 학습 경로" },
              { icon: LineChart, title: "데이터 분석", desc: "학습 패턴 분석 및 예측" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwaC0yVjMwaDJ2MzB6bS0yMC0zMGgyVjBoLTJ2MzB6bTAgMzBoMlYzMGgtMnYzMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                지금 바로 시작하세요
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                30일 무료 체험으로 atomLMS의 모든 기능을 경험해보세요
                <br />
                신용카드 등록 없이 시작할 수 있습니다
              </p>
              <Button
                size="lg"
                className="bg-white text-violet-600 hover:bg-slate-100 text-lg h-14 px-8"
                asChild
              >
                <Link to="/auth">
                  무료로 시작하기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                    <img src={logoIcon} alt="atomLMS" className="h-6 w-6 brightness-0 invert" />
                  </div>
                  <span className="text-lg font-bold text-white">atomLMS</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-primary text-primary-foreground border-primary">
                <p>아톰 안녕?</p>
              </TooltipContent>
            </Tooltip>
            <div className="text-slate-400 text-sm">
              © 2025 atomLMS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
    </TooltipProvider>
  );
};

export default FeaturesShowcase;
