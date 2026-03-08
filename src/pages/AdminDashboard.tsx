import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Users, BookOpen, DollarSign, Activity, TrendingUp, AlertCircle, Brain, MessageCircle, FileText, BarChart3, Sparkles, LayoutDashboard, Loader2 } from "lucide-react";
import { Chatbot } from "@/components/Chatbot";
import { AddUserDialog } from "@/components/admin/AddUserDialog";
import { CourseApprovalDialog } from "@/components/admin/CourseApprovalDialog";
import { SettlementDialog } from "@/components/admin/SettlementDialog";
import { ReportDialog } from "@/components/admin/ReportDialog";
import { AITutorDialog } from "@/components/ai/AITutorDialog";
import { AIFeedbackDialog } from "@/components/ai/AIFeedbackDialog";
import { AIUsageCard } from "@/components/admin/AIUsageCard";
import { useToast } from "@/hooks/use-toast";
import { useAdminDashboardStats } from "@/hooks/useDashboardStats";
import { useTenant } from "@/contexts/TenantContext";
import { usePageTiming } from "@/hooks/usePageTiming";

const AdminDashboard = ({ isDemo = false }: { isDemo?: boolean }) => {
  usePageTiming("AdminDashboard");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tenant } = useTenant();
  const { data: stats, isLoading } = useAdminDashboardStats(tenant?.id);
  
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [courseApprovalOpen, setCourseApprovalOpen] = useState(false);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [aiGradingOpen, setAiGradingOpen] = useState(false);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);

  const handleReviewCourses = () => {
    navigate("/admin/courses");
    toast({
      title: "강의 검토 페이지로 이동",
      description: "대기 중인 강의를 검토할 수 있습니다.",
    });
  };

  const handleServerUsageConfirm = () => {
    console.log("서버 사용량 확인 버튼 클릭됨");
    try {
      toast({
        title: "확인 완료",
        description: "서버 사용량 증가 알림을 확인했습니다.",
      });
    } catch (error) {
      console.error("토스트 표시 중 오류:", error);
    }
  };

  const handleRefundProcess = () => {
    navigate("/admin/revenue");
    toast({
      title: "환불 처리 페이지로 이동",
      description: "대기 중인 환불 요청을 처리할 수 있습니다.",
    });
  };

  return (
    <DashboardLayout userRole="admin" isDemo={isDemo}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            관리자 대시보드
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {isDemo ? 'AI 기반 리포트 생성과 학습 분석으로 스마트한 플랫폼 운영' : '플랫폼 전체를 관리하고 모니터링하세요'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="전체 사용자"
            value={isLoading ? "-" : stats?.totalUsers.toLocaleString() || "0"}
            icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
            description={`학생 ${stats?.studentCount || 0}명`}
            trend="up"
          />
          <StatsCard
            title="전체 강의"
            value={isLoading ? "-" : stats?.totalCourses.toLocaleString() || "0"}
            icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
            description={`활성 ${stats?.activeCourses || 0}개`}
            trend="up"
          />
          <StatsCard
            title="전체 수강신청"
            value={isLoading ? "-" : stats?.totalEnrollments.toLocaleString() || "0"}
            icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
            description="등록된 수강"
            trend="up"
          />
          <StatsCard
            title="대기 중 강의"
            value={isLoading ? "-" : stats?.pendingCourses.toLocaleString() || "0"}
            icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            description="검토 대기"
          />
          
          {/* AI Usage Card - 실시간 토큰 사용량 */}
          <AIUsageCard />
        </div>

        {/* Platform Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">사용자 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <StatRow label="학생" value={stats?.studentCount.toLocaleString() || "0"} percentage={stats ? Math.round((stats.studentCount / Math.max(stats.totalUsers, 1)) * 100) : 0} />
                <StatRow label="강사" value={stats?.teacherCount.toLocaleString() || "0"} percentage={stats ? Math.round((stats.teacherCount / Math.max(stats.totalUsers, 1)) * 100) : 0} />
                <StatRow label="관리자" value={stats?.adminCount.toLocaleString() || "0"} percentage={stats ? Math.round((stats.adminCount / Math.max(stats.totalUsers, 1)) * 100) : 0} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">강의 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <StatRow label="활성 강의" value={stats?.activeCourses.toLocaleString() || "0"} percentage={stats ? Math.round((stats.activeCourses / Math.max(stats.totalCourses, 1)) * 100) : 0} />
                <StatRow label="검토 대기" value={stats?.pendingCourses.toLocaleString() || "0"} percentage={stats ? Math.round((stats.pendingCourses / Math.max(stats.totalCourses, 1)) * 100) : 0} />
                <StatRow label="보관됨" value={stats?.archivedCourses.toLocaleString() || "0"} percentage={stats ? Math.round((stats.archivedCourses / Math.max(stats.totalCourses, 1)) * 100) : 0} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI 사용량</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">이번 달 토큰</span>
                  <span className="font-medium">{stats?.monthlyTokens.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">전체 사용자</span>
                  <span className="font-medium">{stats?.totalUsers || 0}명</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">전체 수강</span>
                  <span className="font-medium">{stats?.totalEnrollments || 0}건</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>최근 가입 사용자</CardTitle>
              <CardDescription>플랫폼에 새로 가입한 사용자</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map((user, index) => (
                    <ActivityLog
                      key={user.user_id || index}
                      type="user"
                      message={`새 사용자 가입: ${user.full_name || '이름 없음'}`}
                      time={user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : ''}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">최근 가입한 사용자가 없습니다</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                알림 및 경고
              </CardTitle>
              <CardDescription>주의가 필요한 항목</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              <AlertItem
                level="info"
                title="최근 등록된 강의"
                description={stats?.recentCourses && stats.recentCourses.length > 0 
                  ? `${stats.recentCourses[0]?.title || '없음'}`
                  : '등록된 강의가 없습니다'}
                action="강의 관리"
                onAction={handleReviewCourses}
              />
              <AlertItem
                level="warning"
                title="대기 중인 강의"
                description={`${stats?.pendingCourses || 0}개의 강의가 승인을 기다리고 있습니다`}
                action="검토하기"
                onAction={handleReviewCourses}
              />
              <AlertItem
                level="info"
                title="AI 토큰 사용량"
                description={`이번 달 ${stats?.monthlyTokens?.toLocaleString() || 0} 토큰 사용`}
                action="확인"
                onAction={handleServerUsageConfirm}
              />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Learning Assistant */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>AI 학습 도우미 기능</CardTitle>
                <Badge variant="default" className="text-xs">AI</Badge>
              </div>
              <CardDescription>AI 기술로더 효과적인 학습을 경험하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer relative" onClick={() => setAiTutorOpen(true)}>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                    <Sparkles className="h-3 w-3 text-white" />
                    <span className="text-xs font-bold text-white">AI</span>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <h3 className="font-semibold">AI 튜터</h3>
                    <p className="text-sm text-muted-foreground">24시간 언제든지 질문하고 실시간 답변을 받으세요</p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer relative" onClick={() => setAiGradingOpen(true)}>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                    <Sparkles className="h-3 w-3 text-white" />
                    <span className="text-xs font-bold text-white">AI</span>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <h3 className="font-semibold">AI 자동 채점</h3>
                    <p className="text-sm text-muted-foreground">과제 제출 시 즉시 채점 결과와 상세한 피드백 제공</p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer relative" onClick={() => setAiAnalysisOpen(true)}>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                    <Sparkles className="h-3 w-3 text-white" />
                    <span className="text-xs font-bold text-white">AI</span>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <h3 className="font-semibold">AI 학습 분석</h3>
                    <p className="text-sm text-muted-foreground">학습 패턴 분석으로 맞춤형 학습 경로 추천</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-900 dark:text-yellow-200">
                  <strong>실제 서비스 시작하기</strong> 버튼을 눌러 회원가입하고 모든 AI 기능을 체험해보세요
                </p>
              </div>
            </CardContent>
          </Card>

        {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <Button 
                  variant="outline" 
                  className="h-16 md:h-20 flex-col gap-1.5 md:gap-2 text-xs md:text-sm"
                  onClick={() => setAddUserOpen(true)}
                >
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                  사용자 추가
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 md:h-20 flex-col gap-1.5 md:gap-2 text-xs md:text-sm"
                  onClick={() => setCourseApprovalOpen(true)}
                >
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                  강의 승인
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 md:h-20 flex-col gap-1.5 md:gap-2 text-xs md:text-sm"
                  onClick={() => setSettlementOpen(true)}
                >
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
                  정산 처리
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 md:h-20 flex-col gap-1.5 md:gap-2 text-xs md:text-sm relative"
                  onClick={() => setReportOpen(true)}
                >
                  <Badge variant="default" className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 h-auto">
                    AI
                  </Badge>
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                  리포트 생성
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Dialogs */}
      <AddUserDialog open={addUserOpen} onOpenChange={setAddUserOpen} />
      <CourseApprovalDialog open={courseApprovalOpen} onOpenChange={setCourseApprovalOpen} />
      <SettlementDialog open={settlementOpen} onOpenChange={setSettlementOpen} />
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} />
      <AITutorDialog open={aiTutorOpen} onOpenChange={setAiTutorOpen} courseContext="데모 강의 컨텍스트" />
      <AIFeedbackDialog open={aiGradingOpen} onOpenChange={setAiGradingOpen} />
      <AIFeedbackDialog open={aiAnalysisOpen} onOpenChange={setAiAnalysisOpen} />

      {/* 챗봇 - 숨김 */}
      {/* <Chatbot userRole="admin" /> */}
    </DashboardLayout>
  );
};

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  description: string; 
  trend?: "up" | "down";
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium whitespace-nowrap">{title}</CardTitle>
      <div className="text-muted-foreground flex-shrink-0">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-1 min-h-[60px] flex flex-col justify-between">
      <div className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis">{value}</div>
      <p className={`text-xs ${trend === "up" ? "text-green-600" : "text-muted-foreground"}`}>
        {description}
      </p>
    </CardContent>
  </Card>
);

const StatRow = ({ label, value, percentage }: { label: string; value: string; percentage: number }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
    <div className="w-full bg-muted rounded-full h-2">
      <div 
        className="bg-primary h-2 rounded-full transition-all duration-300" 
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const ActivityLog = ({ type, message, time }: { type: string; message: string; time: string }) => (
  <div className="flex items-start gap-3">
    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <div className="h-2 w-2 rounded-full bg-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm">{message}</p>
      <p className="text-xs text-muted-foreground">{time}</p>
    </div>
  </div>
);

const AlertItem = ({ 
  level, 
  title, 
  description, 
  action,
  onAction
}: { 
  level: "info" | "warning"; 
  title: string; 
  description: string; 
  action: string;
  onAction?: () => void;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`AlertItem 버튼 클릭됨: ${title}, action: ${action}`);
    if (onAction) {
      console.log("onAction 함수 호출 중...");
      onAction();
    } else {
      console.warn("onAction이 정의되지 않았습니다");
    }
  };

  return (
    <div className="relative flex flex-col sm:flex-row items-start justify-between gap-3 p-3 rounded-lg border">
      <div className="flex-1 min-w-0 pointer-events-none">
        <h4 className="text-sm font-medium mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button 
        size="sm" 
        variant={level === "warning" ? "destructive" : "outline"} 
        className="w-full sm:w-auto flex-shrink-0"
        onClick={handleClick}
        onMouseDown={(e) => {
          console.log("Button mouseDown 이벤트");
          e.stopPropagation();
        }}
        type="button"
      >
        {action}
      </Button>
    </div>
  );
};

export default AdminDashboard;
