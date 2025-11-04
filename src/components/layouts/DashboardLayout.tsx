import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  BarChart3,
  DollarSign,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Building2,
  Brain,
  Shield,
  Eye,
  CalendarCheck,
  Sparkles,
  Palette,
  Zap,
  Trophy,
  Route,
  ClipboardList,
  Briefcase,
} from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import chatbotIcon from "@/assets/chatbot-icon.png";
import aiRobotBadge from "@/assets/ai-robot-badge.png";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useUserRoles, type UserRole } from "@/hooks/useUserRoles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: "student" | "teacher" | "admin" | "operator";
  isDemo?: boolean;
}

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  enabled: boolean;
  hasAI?: boolean;
  isHRD?: boolean;
}

const iconMap: { [key: string]: any } = {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  DollarSign,
  FolderOpen,
  Building2,
  Brain,
  Shield,
  Palette,
  Trophy,
  Route,
};

const DashboardLayout = ({ children, userRole, isDemo = false }: DashboardLayoutProps) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { roles: userRoles } = useUserRoles();

  // CRITICAL: Auto-detect demo mode from URL or use explicit isDemo prop
  // If URL has "role" param OR path starts with /demo, it's demo mode
  const isDemoMode = searchParams.has('role') || isDemo === true || location.pathname.startsWith('/demo');
  
  // In demo mode, use role from URL params, otherwise ALWAYS use the userRole prop
  const effectiveUserRole = (isDemoMode && searchParams.get('role')) 
    ? (searchParams.get('role') as "student" | "teacher" | "admin" | "operator")
    : userRole;

  // Debug logging for demo mode
  useEffect(() => {
    if (isDemoMode) {
      console.log('[DashboardLayout] Demo Mode Active:', {
        propRole: userRole,
        urlRole: searchParams.get('role'),
        effectiveRole: effectiveUserRole,
        fullURL: window.location.href
      });
    }
  }, [isDemoMode, userRole, effectiveUserRole, searchParams]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "로그아웃 실패",
        description: "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getDefaultMenuItems = () => {
    const baseItems = [
      { 
        icon: LayoutDashboard, 
        label: "대시보드", 
        path: `/${effectiveUserRole}`, 
        enabled: true,
        hasAI: effectiveUserRole === "admin" || effectiveUserRole === "operator"
      },
    ];

    if (effectiveUserRole === "student") {
      return [
        ...baseItems,
        { icon: BookOpen, label: "내 강의", path: "/student/courses", enabled: true, hasAI: true },
        { icon: Route, label: "학습 경로", path: "/student/learning-path", enabled: true, hasAI: true },
        { icon: FileText, label: "과제", path: "/student/assignments", enabled: true },
        { icon: MessageSquare, label: "커뮤니티", path: "/student/community", enabled: true },
        { icon: MessageSquare, label: "만족도 조사", path: "/student/satisfaction-survey", enabled: true, isHRD: true },
        { icon: ClipboardList, label: "상담 이력", path: "/student/counseling-log", enabled: true, isHRD: true },
        { icon: Trophy, label: "게이미피케이션", path: "/student/gamification", enabled: false },
        { icon: BarChart3, label: "학습 통계", path: "/student/analytics", enabled: true },
      ];
    }

    if (effectiveUserRole === "teacher") {
      return [
        ...baseItems,
        { icon: BookOpen, label: "강의 관리", path: "/teacher/courses", enabled: true },
        { icon: FileText, label: "과제 관리", path: "/teacher/assignments", enabled: true, hasAI: true },
        { icon: CalendarCheck, label: "출석 관리", path: "/teacher/attendance", enabled: true },
        { icon: CalendarCheck, label: "출결 상세", path: "/teacher/attendance-detail", enabled: true, isHRD: true },
        { icon: ClipboardList, label: "훈련일지", path: "/teacher/training-log", enabled: true, isHRD: true },
        { icon: MessageSquare, label: "만족도 조사", path: "/teacher/satisfaction-survey", enabled: true, isHRD: true },
        { icon: ClipboardList, label: "상담일지", path: "/teacher/counseling-log", enabled: true, isHRD: true },
        { icon: Users, label: "중도탈락 관리", path: "/teacher/dropout-management", enabled: true, isHRD: true },
        { icon: Trophy, label: "수료 요건", path: "/teacher/training-completion", enabled: true, isHRD: true },
        { icon: DollarSign, label: "훈련수당", path: "/teacher/training-allowance", enabled: true, isHRD: true },
        { icon: BarChart3, label: "훈련 리포트", path: "/teacher/training-report", enabled: true, isHRD: true },
        { icon: Users, label: "학생 관리", path: "/teacher/students", enabled: true },
        { icon: BarChart3, label: "통계", path: "/teacher/analytics", enabled: true },
        { icon: DollarSign, label: "수익", path: "/teacher/revenue", enabled: true },
      ];
    }

    if (effectiveUserRole === "operator") {
      // 운영자(SaaS 플랫폼 소유주) 메뉴
      return [
        ...baseItems,
        { icon: Building2, label: "고객사 관리", path: "/operator/tenants", enabled: true },
        { icon: BarChart3, label: "사용량 관리", path: "/operator/usage", enabled: true },
        { icon: Brain, label: "AI 로그", path: "/operator/ai-logs", enabled: true, hasAI: true },
        { icon: DollarSign, label: "전체 매출", path: "/operator/revenue", enabled: true },
        { icon: Shield, label: "시스템 모니터링", path: "/operator/monitoring", enabled: true },
        { icon: Settings, label: "플랫폼 설정", path: "/operator/settings", enabled: true },
        { icon: BookOpen, label: "매뉴얼", path: "/operator/manual", enabled: true },
      ];
    }

    // admin (교육사업자/기관) - hide certain menus in demo mode
    const adminItems = [
      ...baseItems,
      { icon: Users, label: "사용자 관리", path: "/admin/users", enabled: true },
      { icon: BookOpen, label: "강좌 관리", path: "/admin/courses", enabled: true },
      { icon: FolderOpen, label: "콘텐츠 관리", path: "/admin/content", enabled: true },
      { icon: BarChart3, label: "학습 관리", path: "/admin/learning", enabled: true, hasAI: true },
      { icon: CalendarCheck, label: "출석 관리", path: "/admin/attendance", enabled: true, isHRD: true },
      { icon: ClipboardList, label: "훈련일지", path: "/admin/training-log", enabled: true, isHRD: true },
      { icon: MessageSquare, label: "만족도 조사", path: "/admin/satisfaction-survey", enabled: true, isHRD: true },
      { icon: ClipboardList, label: "상담일지", path: "/admin/counseling-log", enabled: true, isHRD: true },
      { icon: Users, label: "중도탈락 관리", path: "/admin/dropout-management", enabled: true, isHRD: true },
      { icon: Trophy, label: "수료 관리", path: "/admin/training-completion", enabled: true, isHRD: true },
      { icon: FileText, label: "성적 관리", path: "/admin/grades", enabled: true, isHRD: true },
      { icon: DollarSign, label: "훈련수당", path: "/admin/training-allowance", enabled: true, isHRD: true },
      { icon: Brain, label: "AI 로그", path: "/admin/ai-logs", enabled: true, hasAI: true },
      { icon: DollarSign, label: "매출 관리", path: "/admin/revenue", enabled: true },
      { icon: Shield, label: "시스템 모니터링", path: "/admin/monitoring", enabled: true },
      { icon: Settings, label: "시스템 설정", path: "/admin/settings", enabled: true },
      { icon: BookOpen, label: "매뉴얼", path: "/admin/manual", enabled: true },
    ];

    // Only add operator menus if NOT in demo mode (to separate concerns clearly)
    if (!isDemoMode) {
      // In non-demo mode, we can check if user is actually an operator
      // For now, we keep admin items as is
    }

    return adminItems;
  };

  useEffect(() => {
    fetchMenuOrder();
  }, [effectiveUserRole, isDemoMode]);

  const fetchMenuOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_order")
        .select("menu_items")
        .eq("user_role", effectiveUserRole)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data && data.menu_items) {
        const defaultItems = getDefaultMenuItems();
        const savedItems = data.menu_items as any[];
        
        // Merge saved settings with default items
        const mergedItems = defaultItems.map(defaultItem => {
          const savedItem = savedItems.find(s => s.path === defaultItem.path);
          if (savedItem) {
            return {
              ...defaultItem,
              enabled: savedItem.enabled,
              icon: iconMap[savedItem.icon] || defaultItem.icon,
            };
          }
          return defaultItem;
        });
        
        // Filter out disabled items
        setMenuItems(mergedItems.filter(item => item.enabled));
      } else {
        setMenuItems(getDefaultMenuItems());
      }
    } catch (error) {
      console.error("Error fetching menu order:", error);
      setMenuItems(getDefaultMenuItems());
    }
  };

  return (
    <TooltipProvider>
      {isDemoMode ? (
        // Demo mode: just render children without any layout wrapper
        <>{children}</>
      ) : (
      <div className="min-h-screen bg-background">
      {/* Top Navigation - Hidden in demo mode */}
      {!isDemoMode && (
        <header className="sticky top-0 z-40 border-b bg-background/98 backdrop-blur-xl supports-[backdrop-filter]:bg-background/95 shadow-sm">
        <div className="flex h-16 md:h-20 items-center gap-2 md:gap-4 px-3 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden rounded-xl flex-shrink-0"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/" className="flex items-center gap-1.5 md:gap-2 group flex-shrink-0">
                <img src={logoIcon} alt="Logo" className="h-9 w-9 md:h-12 md:w-12" />
                <span className="text-lg md:text-2xl font-logo font-bold text-foreground tracking-tight">atomLMS</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-primary text-primary-foreground border-primary">
              <p>아톰 안녕?</p>
            </TooltipContent>
          </Tooltip>


          <div className="flex items-center gap-1.5 md:gap-3 ml-auto">
            {effectiveUserRole === "admin" && (
              <Link to="/demo">
                <Button size="sm" className="gap-2 rounded-full bg-foreground text-background hover:bg-foreground/90">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">데모 모드</span>
                </Button>
              </Link>
            )}
            
            {/* Only show role switcher if user has multiple roles */}
            {userRoles.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2 rounded-full">
                    {effectiveUserRole === "student" && <GraduationCap className="h-4 w-4" />}
                    {effectiveUserRole === "teacher" && <BookOpen className="h-4 w-4" />}
                    {effectiveUserRole === "admin" && <Shield className="h-4 w-4" />}
                    {effectiveUserRole === "operator" && <Building2 className="h-4 w-4" />}
                    <span className="hidden sm:inline">
                      {effectiveUserRole === "student" && "학생"}
                      {effectiveUserRole === "teacher" && "강사"}
                      {effectiveUserRole === "admin" && "관리자"}
                      {effectiveUserRole === "operator" && "운영자"}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuLabel>역할별 대시보드</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userRoles.includes('student') && (
                    <DropdownMenuItem asChild>
                      <Link to="/student" className="flex items-center cursor-pointer">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        학생
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {userRoles.includes('teacher') && (
                    <DropdownMenuItem asChild>
                      <Link to="/teacher" className="flex items-center cursor-pointer">
                        <BookOpen className="mr-2 h-4 w-4" />
                        강사
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {userRoles.includes('admin') && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        관리자
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {userRoles.includes('operator') && (
                    <DropdownMenuItem asChild>
                      <Link to="/operator" className="flex items-center cursor-pointer">
                        <Building2 className="mr-2 h-4 w-4" />
                        운영자
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1.5 md:gap-2 rounded-xl hover:bg-primary/10 flex-shrink-0">
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-premium">
                    <span className="text-xs md:text-sm font-semibold text-primary-foreground">홍</span>
                  </div>
                  <span className="hidden sm:inline-block font-medium text-sm md:text-base">홍길동</span>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/50">
                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg">
                  <Settings className="mr-2 h-4 w-4" />
                  설정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="rounded-lg">
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed z-30 border-r bg-background/98 backdrop-blur-xl transition-all duration-300 shadow-sm",
            isDemoMode ? "left-0 top-[130px] h-[calc(100vh-130px)]" : "left-0 top-20 h-[calc(100vh-5rem)]",
            sidebarCollapsed ? "w-16" : "w-64",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "md:translate-x-0"
          )}
        >
          {/* Collapse Toggle Button - Desktop Only */}
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
              {menuItems
                .filter(item => {
                  // 디자인 템플릿 메뉴는 항상 제외
                  if (item.label === "디자인 템플릿") {
                    return false;
                  }
                  // 게이미피케이션 메뉴는 항상 제외
                  if (item.label === "게이미피케이션") {
                    return false;
                  }
                  // 데모 모드에서는 enabled가 true인 것만 표시
                  if (isDemoMode) {
                    return item.enabled === true;
                  }
                  // 일반 모드에서는 enabled가 false인 항목 제외
                  return item.enabled !== false;
                })
                .map((item) => (
                  // 일반 모드에서는 enabled 체크 안함, 데모 모드에서만 체크
                  (isDemoMode ? item.enabled : true) ? (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <Link 
                        to={isDemoMode ? `${item.path}${item.path.includes('?') ? '&' : '?'}role=${effectiveUserRole}` : item.path}
                      >
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full h-11 text-sm rounded-xl hover:bg-primary/10 hover:text-primary hover:shadow-md transition-all duration-300 group overflow-visible",
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
                                  <Badge variant="outline" className="px-1.5 py-0 h-5 text-[10px] font-bold bg-blue-500/10 border-blue-500/20 text-blue-600 whitespace-nowrap">
                                    HRD
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    {sidebarCollapsed && (
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ) : (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full h-11 text-sm rounded-xl opacity-40 cursor-not-allowed",
                            sidebarCollapsed ? "justify-center px-0" : "justify-start gap-3"
                          )}
                          disabled
                        >
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {!sidebarCollapsed && (
                            <span className="font-medium">{item.label}</span>
                          )}
                        </Button>
                        {!sidebarCollapsed && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                            준비중
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    {sidebarCollapsed && (
                      <TooltipContent side="right">
                        <p>{item.label} (준비중)</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                )
              ))}
            </nav>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300",
            isDemoMode && "pt-[130px]",
            sidebarOpen && !sidebarCollapsed ? "md:ml-64" : sidebarCollapsed ? "md:ml-16" : "md:ml-0"
          )}
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* AI Chatbot Button - Only for admin and operator */}
      {!isDemoMode && (effectiveUserRole === "admin" || effectiveUserRole === "operator") && (
        <Button
          size="icon"
          variant="premium"
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 h-14 w-14 md:h-16 md:w-16 rounded-full shadow-glow hover:shadow-elegant hover:scale-110 transition-all duration-300 z-50"
        >
          <img src={chatbotIcon} alt="AI Chatbot" className="h-7 w-7 md:h-8 md:w-8" />
        </Button>
      )}
    </div>
      )}
    </TooltipProvider>
  );
};

export default DashboardLayout;
