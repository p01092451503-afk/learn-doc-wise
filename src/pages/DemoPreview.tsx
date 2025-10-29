import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, BookOpen, BarChart3, Brain, Award, Clock, FileText, TrendingUp, DollarSign, Activity, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const DemoPreview = () => {
  const [activeRole, setActiveRole] = useState("student");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">WebHeads LMS</span>
            <Badge variant="secondary" className="ml-2">Demo Mode</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button>회원가입하기</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            WebHeads LMS 데모 체험
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            다양한 역할별 대시보드와 기능을 미리 체험해보세요. 
            실제 사용 환경을 시뮬레이션한 데모입니다.
          </p>
        </div>

        {/* Role Selector */}
        <Tabs value={activeRole} onValueChange={setActiveRole} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="student">학생 대시보드</TabsTrigger>
            <TabsTrigger value="teacher">강사 대시보드</TabsTrigger>
            <TabsTrigger value="admin">관리자 대시보드</TabsTrigger>
          </TabsList>

          {/* Student Dashboard Preview */}
          <TabsContent value="student" className="space-y-6">
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  학생 대시보드
                </CardTitle>
                <CardDescription>
                  학습 진행 상황을 한눈에 확인하고 AI 기반 학습 도우미를 이용할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats Preview */}
                <div className="grid gap-4 md:grid-cols-4">
                  <StatCard icon={<BookOpen />} title="수강 중인 강의" value="5" />
                  <StatCard icon={<Clock />} title="학습 시간" value="24.5h" />
                  <StatCard icon={<FileText />} title="완료한 과제" value="12/15" />
                  <StatCard icon={<Award />} title="획득 뱃지" value="8" />
                </div>

                {/* Features List */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FeatureItem
                    icon={<Brain />}
                    title="AI 튜터"
                    description="개인화된 학습 지원과 실시간 질문 답변"
                  />
                  <FeatureItem
                    icon={<TrendingUp />}
                    title="학습 분석"
                    description="진도율, 성적, 참여도 실시간 추적"
                  />
                  <FeatureItem
                    icon={<Users />}
                    title="협업 학습"
                    description="토론방, Q&A, 그룹 스터디 기능"
                  />
                  <FeatureItem
                    icon={<Award />}
                    title="성취 시스템"
                    description="뱃지, 수료증 자동 발급"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teacher Dashboard Preview */}
          <TabsContent value="teacher" className="space-y-6">
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  강사 대시보드
                </CardTitle>
                <CardDescription>
                  강의를 생성하고 학생들의 학습을 관리하며 수익을 분석할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats Preview */}
                <div className="grid gap-4 md:grid-cols-4">
                  <StatCard icon={<Users />} title="전체 학생" value="342" />
                  <StatCard icon={<BookOpen />} title="활성 강의" value="8" />
                  <StatCard icon={<DollarSign />} title="이번 달 수익" value="₩4.2M" />
                  <StatCard icon={<TrendingUp />} title="평균 평점" value="4.8" />
                </div>

                {/* Features List */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FeatureItem
                    icon={<BookOpen />}
                    title="강의 생성/관리"
                    description="비디오, 퀴즈, 과제를 포함한 강의 제작"
                  />
                  <FeatureItem
                    icon={<BarChart3 />}
                    title="학생 분석"
                    description="학생별 진도, 성적, 참여도 추적"
                  />
                  <FeatureItem
                    icon={<CheckCircle />}
                    title="자동 채점"
                    description="AI 기반 과제 자동 채점 및 피드백"
                  />
                  <FeatureItem
                    icon={<DollarSign />}
                    title="수익 관리"
                    description="강의 수익 통계 및 정산 관리"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Dashboard Preview */}
          <TabsContent value="admin" className="space-y-6">
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  관리자 대시보드
                </CardTitle>
                <CardDescription>
                  플랫폼 전체를 관리하고 사용자, 강의, 결제를 모니터링할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats Preview */}
                <div className="grid gap-4 md:grid-cols-4">
                  <StatCard icon={<Users />} title="전체 사용자" value="2,847" />
                  <StatCard icon={<BookOpen />} title="전체 강의" value="156" />
                  <StatCard icon={<DollarSign />} title="총 매출" value="₩45M" />
                  <StatCard icon={<Activity />} title="활성 세션" value="1,234" />
                </div>

                {/* Features List */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FeatureItem
                    icon={<Users />}
                    title="사용자 관리"
                    description="학생, 강사, 관리자 계정 관리"
                  />
                  <FeatureItem
                    icon={<BookOpen />}
                    title="강의 승인/관리"
                    description="강의 검토, 승인, 카테고리 관리"
                  />
                  <FeatureItem
                    icon={<BarChart3 />}
                    title="플랫폼 분석"
                    description="전체 통계, 트렌드, 성과 분석"
                  />
                  <FeatureItem
                    icon={<DollarSign />}
                    title="결제/정산 관리"
                    description="결제 처리, 환불, 강사 정산"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              지금 바로 시작하세요!
            </h2>
            <p className="text-muted-foreground mb-6">
              데모를 체험해보셨나요? 회원가입하고 모든 기능을 사용해보세요.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg">
                  회원가입하기
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline">
                  홈으로 돌아가기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
            주요 기능 미리보기
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI 기반 학습</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  개인화된 AI 튜터가 학습을 도와주고, 자동으로 피드백과 요약을 제공합니다
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>협업 학습</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  토론, Q&A, 그룹 스터디를 통해 학습자들과 함께 성장하세요
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>실시간 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  학습 진도, 성적, 참여도를 실시간으로 확인하고 개선하세요
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-primary">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex gap-3 p-4 rounded-lg border hover:border-primary/50 transition-colors">
    <div className="text-primary flex-shrink-0">{icon}</div>
    <div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default DemoPreview;
