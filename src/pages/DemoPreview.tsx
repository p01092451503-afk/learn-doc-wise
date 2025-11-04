import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Users, 
  MessageSquare, 
  BarChart3, 
  DollarSign, 
  Trophy, 
  Route,
  CalendarCheck,
  ClipboardList,
  Target,
  Award,
  GraduationCap,
  Shield,
  FolderOpen,
  Brain,
  Activity,
  Settings,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import StudentDashboard from "./StudentDashboard";
import StudentCourses from "./StudentCourses";
import StudentAssignments from "./StudentAssignments";
import StudentCommunity from "./StudentCommunity";
import StudentAnalytics from "./StudentAnalytics";
import StudentGamification from "./StudentGamification";
import StudentLearningPath from "./StudentLearningPath";
import StudentSatisfactionSurvey from "./student/StudentSatisfactionSurvey";
import StudentCounselingLog from "./student/StudentCounselingLog";
import TeacherDashboard from "./TeacherDashboard";
import TeacherCourses from "./TeacherCourses";
import TeacherAssignments from "./TeacherAssignments";
import TeacherStudents from "./TeacherStudents";
import TeacherAnalytics from "./TeacherAnalytics";
import TeacherRevenue from "./TeacherRevenue";
import TeacherAttendance from "./TeacherAttendance";
import TeacherAttendanceDetail from "./teacher/TeacherAttendanceDetail";
import TeacherTrainingLog from "./teacher/TeacherTrainingLog";
import TeacherSatisfactionSurvey from "./teacher/TeacherSatisfactionSurvey";
import TeacherCounselingLog from "./teacher/TeacherCounselingLog";
import TeacherDropoutManagement from "./teacher/TeacherDropoutManagement";
import TeacherTrainingCompletion from "./teacher/TeacherTrainingCompletion";
import TeacherTrainingAllowance from "./teacher/TeacherTrainingAllowance";
import TeacherTrainingReport from "./teacher/TeacherTrainingReport";
import AdminDashboard from "./AdminDashboard";
import OperatorDashboard from "./OperatorDashboard";
import AdminUsers from "./AdminUsers";
import AdminCourses from "./AdminCourses";
import AdminContent from "./AdminContent";
import AdminLearning from "./AdminLearning";
import AdminAILogs from "./AdminAILogs";
import AdminTemplates from "./AdminTemplates";
import AdminTenants from "./AdminTenants";
import AdminRevenue from "./AdminRevenue";
import AdminUsageManagement from "./AdminUsageManagement";
import AdminMonitoring from "./AdminMonitoring";
import AdminSettings from "./AdminSettings";
import AdminAnalytics from "./AdminAnalytics";
import AdminAttendance from "./admin/AdminAttendance";
import AdminTrainingLog from "./admin/AdminTrainingLog";
import AdminSatisfactionSurvey from "./admin/AdminSatisfactionSurvey";
import AdminCounselingLog from "./admin/AdminCounselingLog";
import AdminDropoutManagement from "./admin/AdminDropoutManagement";
import AdminTrainingCompletion from "./admin/AdminTrainingCompletion";
import AdminGrades from "./admin/AdminGrades";
import AdminTrainingAllowance from "./admin/AdminTrainingAllowance";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DemoRole = "student" | "teacher" | "admin";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  hasAI?: boolean;
  isHRD?: boolean;
}

const DemoPreview = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeRole = (searchParams.get("role") as DemoRole) || "student";
  const activePage = searchParams.get("page") || "dashboard";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const setActiveRole = (role: DemoRole) => {
    setSearchParams({ role, page: "dashboard" });
  };

  const getMenuItems = (): MenuItem[] => {
    if (activeRole === "student") {
      return [
        { icon: LayoutDashboard, label: "대시보드", path: "dashboard" },
        { icon: BookOpen, label: "내 강의", path: "courses", hasAI: true },
        { icon: Route, label: "학습 경로", path: "learning-path", hasAI: true },
        { icon: FileText, label: "과제", path: "assignments" },
        { icon: MessageSquare, label: "커뮤니티", path: "community" },
        { icon: MessageSquare, label: "만족도 조사", path: "satisfaction-survey", isHRD: true },
        { icon: ClipboardList, label: "상담 이력", path: "counseling-log", isHRD: true },
        { icon: BarChart3, label: "학습 통계", path: "analytics" },
      ];
    }
    
    if (activeRole === "teacher") {
      return [
        { icon: LayoutDashboard, label: "대시보드", path: "dashboard" },
        { icon: BookOpen, label: "강의 관리", path: "courses" },
        { icon: FileText, label: "과제 관리", path: "assignments", hasAI: true },
        { icon: CalendarCheck, label: "출석 관리", path: "attendance" },
        { icon: CalendarCheck, label: "출결 상세", path: "attendance-detail", isHRD: true },
        { icon: ClipboardList, label: "훈련일지", path: "training-log", isHRD: true },
        { icon: MessageSquare, label: "만족도 조사", path: "satisfaction-survey", isHRD: true },
        { icon: ClipboardList, label: "상담일지", path: "counseling-log", isHRD: true },
        { icon: Users, label: "중도탈락 관리", path: "dropout-management", isHRD: true },
        { icon: Trophy, label: "수료 요건", path: "training-completion", isHRD: true },
        { icon: DollarSign, label: "훈련수당", path: "training-allowance", isHRD: true },
        { icon: BarChart3, label: "훈련 리포트", path: "training-report", isHRD: true },
        { icon: Users, label: "학생 관리", path: "students" },
        { icon: BarChart3, label: "통계", path: "analytics" },
        { icon: DollarSign, label: "수익", path: "revenue" },
      ];
    }
    
    // admin
    return [
      { icon: LayoutDashboard, label: "대시보드", path: "dashboard" },
      { icon: Users, label: "사용자 관리", path: "users" },
      { icon: BookOpen, label: "강좌 관리", path: "courses" },
      { icon: FolderOpen, label: "콘텐츠 관리", path: "content" },
      { icon: GraduationCap, label: "학습 관리", path: "learning", hasAI: true },
      { icon: CalendarCheck, label: "출석 관리", path: "attendance", isHRD: true },
      { icon: ClipboardList, label: "훈련일지", path: "training-log", isHRD: true },
      { icon: MessageSquare, label: "만족도 조사", path: "satisfaction-survey", isHRD: true },
      { icon: ClipboardList, label: "상담일지", path: "counseling-log", isHRD: true },
      { icon: Users, label: "중도탈락 관리", path: "dropout-management", isHRD: true },
      { icon: Trophy, label: "수료 관리", path: "training-completion", isHRD: true },
      { icon: FileText, label: "성적 관리", path: "grades", isHRD: true },
      { icon: DollarSign, label: "훈련수당", path: "training-allowance", isHRD: true },
      { icon: Brain, label: "AI 로그", path: "ai-logs", hasAI: true },
      { icon: DollarSign, label: "매출 관리", path: "revenue" },
      { icon: Activity, label: "시스템 모니터링", path: "monitoring" },
      { icon: BarChart3, label: "분석 도구", path: "analytics" },
      { icon: Settings, label: "시스템 설정", path: "settings" },
    ];
  };

  const menuItems = getMenuItems();

  const renderContent = () => {
    // Student pages
    if (activeRole === "student") {
      switch (activePage) {
        case "courses":
          return <StudentCourses />;
        case "assignments":
          return <StudentAssignments />;
        case "community":
          return <StudentCommunity />;
        case "analytics":
          return <StudentAnalytics />;
        case "learning-path":
          return <StudentLearningPath />;
        case "satisfaction-survey":
          return <StudentSatisfactionSurvey />;
        case "counseling-log":
          return <StudentCounselingLog />;
        default:
          return <StudentDashboard isDemo={true} />;
      }
    }
    
    // Teacher pages
    if (activeRole === "teacher") {
      switch (activePage) {
        case "courses":
          return <TeacherCourses />;
        case "assignments":
          return <TeacherAssignments />;
        case "students":
          return <TeacherStudents />;
        case "attendance":
          return <TeacherAttendance isDemo={true} />;
        case "attendance-detail":
          return <TeacherAttendanceDetail />;
        case "training-log":
          return <TeacherTrainingLog />;
        case "satisfaction-survey":
          return <TeacherSatisfactionSurvey />;
        case "counseling-log":
          return <TeacherCounselingLog />;
        case "dropout-management":
          return <TeacherDropoutManagement />;
        case "training-completion":
          return <TeacherTrainingCompletion />;
        case "training-allowance":
          return <TeacherTrainingAllowance />;
        case "training-report":
          return <TeacherTrainingReport />;
        case "analytics":
          return <TeacherAnalytics />;
        case "revenue":
          return <TeacherRevenue />;
        default:
          return <TeacherDashboard isDemo={true} />;
      }
    }
    
    // Admin pages
    if (activeRole === "admin") {
      switch (activePage) {
        case "users":
          return <AdminUsers />;
        case "courses":
          return <AdminCourses />;
        case "content":
          return <AdminContent />;
        case "learning":
          return <AdminLearning />;
        case "attendance":
          return <AdminAttendance />;
        case "training-log":
          return <AdminTrainingLog />;
        case "satisfaction-survey":
          return <AdminSatisfactionSurvey />;
        case "counseling-log":
          return <AdminCounselingLog />;
        case "dropout-management":
          return <AdminDropoutManagement />;
        case "training-completion":
          return <AdminTrainingCompletion />;
        case "grades":
          return <AdminGrades />;
        case "training-allowance":
          return <AdminTrainingAllowance />;
        case "ai-logs":
          return <AdminAILogs />;
        case "templates":
          return <AdminTemplates />;
        case "revenue":
          return <AdminRevenue />;
        case "monitoring":
          return <AdminMonitoring />;
        case "settings":
          return <AdminSettings />;
        case "analytics":
          return <AdminAnalytics />;
        default:
          return <AdminDashboard isDemo={true} />;
      }
    }
    
    return <StudentDashboard isDemo={true} />;
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
      {/* Demo Mode Header */}
      <div className="border-b sticky top-0 bg-background/98 backdrop-blur-xl z-[60] shadow-sm">
        <div className="container mx-auto px-3 md:px-4 h-16 md:h-20 flex items-center justify-start gap-4">
          <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/" className="flex items-center gap-1.5 md:gap-2">
                  <img src={logoIcon} alt="Logo" className="h-9 w-9 md:h-12 md:w-12" />
                  <span className="text-lg md:text-2xl font-logo font-bold text-foreground tracking-tight">atomLMS</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-primary text-primary-foreground border-primary">
                <p>아톰 안녕?</p>
              </TooltipContent>
            </Tooltip>
            <Button variant="secondary" size="sm" className="text-xs hidden sm:inline-flex gap-1.5 pointer-events-none">
              <Bot className="h-3.5 w-3.5" />
              데모 모드
            </Button>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-xs md:text-sm text-muted-foreground hidden lg:inline">역할 전환:</span>
              <Select value={activeRole} onValueChange={(value) => setActiveRole(value as DemoRole)}>
                <SelectTrigger className="w-[100px] md:w-[140px] text-xs md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">학생</SelectItem>
                  <SelectItem value="teacher">강사</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Link to="/auth?from=demo">
              <Button size="sm" className="text-xs md:text-sm">회원가입</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/10 border-b border-primary/20 shadow-sm">
        <div className="container mx-auto px-3 md:px-4 py-2.5 md:py-3.5">
          <p className="text-xs md:text-sm text-center font-medium">
            💡 <strong>
              {activeRole === "student" ? "학생" : 
               activeRole === "teacher" ? "강사" : 
               "관리자"}
            </strong>
            {" "}대시보드를 <span className="hidden sm:inline">자유롭게 </span>체험해보세요<span className="hidden md:inline">. 실제 작동하는 UI로 구성되어 있습니다</span>
          </p>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-[120px] md:top-[132px] h-[calc(100vh-120px)] md:h-[calc(100vh-132px)] border-r bg-background/98 backdrop-blur-xl transition-all duration-300 shadow-sm z-30",
            sidebarCollapsed ? "w-16" : "w-64"
          )}
        >
          {/* Collapse Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-primary/10"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          <nav className={cn(
            "flex flex-col gap-1.5 overflow-y-auto h-full transition-all duration-300",
            sidebarCollapsed ? "p-2" : "p-4"
          )}>
            {menuItems.map((item) => (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => setSearchParams({ role: activeRole, page: item.path })}
                    className={cn(
                      "w-full h-11 text-sm rounded-xl hover:bg-primary/10 hover:text-primary hover:shadow-md transition-all duration-300 group",
                      activePage === item.path && "bg-primary/10 text-primary",
                      sidebarCollapsed ? "justify-center px-0" : "justify-start gap-3 pr-2"
                    )}
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    {!sidebarCollapsed && (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                        <div className="flex items-center gap-1.5">
                          {item.hasAI && (
                            <Badge variant="outline" className="px-1.5 py-0 h-5 text-[10px] font-bold bg-primary/10 border-primary/20 text-primary whitespace-nowrap">
                              AI
                            </Badge>
                          )}
                          {item.isHRD && (
                            <Badge variant="outline" className="px-1.5 py-0 h-5 text-[10px] font-bold bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              HRD
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </Button>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right" className="bg-primary text-primary-foreground">
                    <p>{item.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}>
          <div className="p-4 md:p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-xs md:max-w-none md:w-auto">
        <Link to="/auth?from=demo" className="block">
          <Button size="lg" variant="gold" className="w-full md:w-auto shadow-glow hover:shadow-elegant transition-all text-sm md:text-base">
            실제 서비스 시작하기
          </Button>
        </Link>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default DemoPreview;
