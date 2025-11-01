import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Search,
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
} from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import chatbotIcon from "@/assets/chatbot-icon.png";
import aiRobotBadge from "@/assets/ai-robot-badge.png";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if we're in demo mode from URL params
  const isDemoMode = isDemo || searchParams.has('role');
  
  // In demo mode, always use the role from URL params if available (this prevents role switching bugs)
  const effectiveUserRole = isDemoMode && searchParams.get('role') 
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
        { icon: ClipboardList, label: "훈련일지", path: "/teacher/training-log", enabled: true },
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
      ];
    }

    // admin (교육사업자/기관) - hide certain menus in demo mode
    const adminItems = [
      ...baseItems,
      { icon: Users, label: "사용자 관리", path: "/admin/users", enabled: true },
      { icon: BookOpen, label: "강좌 관리", path: "/admin/courses", enabled: true },
      { icon: FolderOpen, label: "콘텐츠 관리", path: "/admin/content", enabled: true },
      { icon: BarChart3, label: "학습 관리", path: "/admin/learning", enabled: true, hasAI: true },
      { icon: Brain, label: "AI 로그", path: "/admin/ai-logs", enabled: true, hasAI: true },
      { icon: DollarSign, label: "매출 관리", path: "/admin/revenue", enabled: true },
      { icon: Shield, label: "시스템 모니터링", path: "/admin/monitoring", enabled: true },
      { icon: Settings, label: "시스템 설정", path: "/admin/settings", enabled: true },
    ];

    // Only add operator menus if NOT in demo mode (to separate concerns clearly)
    if (!isDemoMode) {
      // In non-demo mode, we can check if user is actually an operator
      // For now, we keep admin items as is
    }

    return adminItems;
  };

  useEffect(() => {
    if (isDemoMode) {
      // 데모 모드에서는 데이터베이스 호출 없이 기본 메뉴만 사용
      setMenuItems(getDefaultMenuItems());
    } else {
      fetchMenuOrder();
    }
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
        // Convert string icons to actual icon components
        const items = (data.menu_items as any[]).map((item: any) => ({
          ...item,
          icon: iconMap[item.icon] || LayoutDashboard,
        }));
        setMenuItems(items);
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

          <div className="hidden lg:flex flex-1 items-center gap-4 ml-4">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="강의, 과제 검색..."
                className="pl-12 h-11 rounded-xl border-border/50 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3 ml-auto">
            {effectiveUserRole === "admin" && (
              <Link to="/demo">
                <Button variant="outline" size="sm" className="gap-2 rounded-xl border-primary/30 hover:bg-primary/10">
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">데모 모드</span>
                </Button>
              </Link>
            )}
            
            <LanguageSwitcher />
            
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-primary/10 flex-shrink-0">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full ring-2 ring-background" />
            </Button>

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
                  // 데모 모드에서는 enabled가 true인 것만 표시
                  if (isDemoMode) {
                    return item.enabled === true;
                  }
                  // 일반 모드에서는 모든 항목 표시 (enabled 여부와 관계없이)
                  return true;
                })
                .map((item) => (
                  item.enabled ? (
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
                              {item.hasAI && (
                                <span className="px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary whitespace-nowrap flex-shrink-0">
                                  AI
                                </span>
                              )}
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
    </TooltipProvider>
  );
};

export default DashboardLayout;
