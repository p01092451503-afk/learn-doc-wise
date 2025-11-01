import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Building2,
  BarChart3,
  Brain,
  DollarSign,
  Shield,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  ChevronRight,
  Zap,
  Sparkles,
  Layers,
  Package,
  BookOpen,
  Network,
  Users,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import aiRobotBadge from "@/assets/ai-robot-badge.png";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface OperatorLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  hasAI?: boolean;
}

const menuItems: MenuItem[] = [
  { icon: BarChart3, label: "대시보드", path: "/operator" },
  { icon: Building2, label: "테넌트 관리", path: "/operator/tenants" },
  { icon: BarChart3, label: "사용량", path: "/operator/usage" },
  { icon: Brain, label: "AI 로그", path: "/operator/ai-logs", hasAI: true },
  { icon: DollarSign, label: "매출", path: "/operator/revenue" },
  { icon: Shield, label: "모니터링", path: "/operator/monitoring" },
  { icon: Layers, label: "기능 목록", path: "/operator/features" },
  { icon: Package, label: "기술 스택", path: "/operator/tech-stack" },
  { icon: Brain, label: "국비환급과정", path: "/operator/government-training" },
  { icon: Settings, label: "설정", path: "/operator/settings" },
  { icon: BookOpen, label: "매뉴얼", path: "/operator/manual" },
  { icon: Network, label: "시스템 다이어그램", path: "/operator/system-diagram" },
];

const OperatorLayout = ({ children }: OperatorLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("operator-sidebar-collapsed");
    return saved === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("operator-theme");
    return (saved as "dark" | "light") || "dark";
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("operator-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem("operator-theme", theme);
  }, [theme]);

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    toast({
      title: "테마 변경",
      description: `${newTheme === "dark" ? "다크" : "라이트"} 모드로 전환되었습니다.`,
    });
  };

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

  return (
    <TooltipProvider>
      <div className={cn(
        "min-h-screen transition-colors duration-300",
        theme === "dark" ? "bg-slate-950" : "bg-slate-50"
      )}>
      {/* Top Navigation Bar */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 border-b backdrop-blur-xl transition-colors duration-300",
        theme === "dark" 
          ? "border-slate-800 bg-slate-900/95" 
          : "border-slate-200 bg-white/95"
      )}>
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "lg:hidden transition-colors",
                theme === "dark" 
                  ? "text-slate-300 hover:text-white hover:bg-slate-800" 
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/operator" className="flex items-center gap-2 group">
                  <div>
                    <span className={cn(
                      "text-lg font-bold transition-colors",
                      theme === "dark" ? "text-white" : "text-slate-900"
                    )}>atomLMS</span>
                    <span className="ml-2 text-xs font-medium text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">Operator</span>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-primary text-primary-foreground border-primary">
                <p>아톰 안녕?</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              )} />
              <Input
                placeholder="검색..."
                className={cn(
                  "pl-10 focus:border-violet-500 focus:ring-violet-500/20 transition-colors",
                  theme === "dark"
                    ? "bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
                    : "bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-500"
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Role Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(
                    "gap-2 transition-colors hover:border-violet-500",
                    theme === "dark"
                      ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                      : "bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden md:inline-block">역할 전환</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className={cn(
                  "w-48 transition-colors",
                  theme === "dark" 
                    ? "bg-slate-800 border-slate-700" 
                    : "bg-white border-slate-200"
                )}
              >
                <DropdownMenuLabel className={theme === "dark" ? "text-slate-200" : "text-slate-900"}>
                  역할별 대시보드
                </DropdownMenuLabel>
                <DropdownMenuSeparator className={theme === "dark" ? "bg-slate-700" : "bg-slate-200"} />
                <DropdownMenuItem asChild>
                  <Link to="/student" className={cn(
                    "flex items-center cursor-pointer transition-colors",
                    theme === "dark"
                      ? "text-slate-300 focus:bg-slate-700 focus:text-white"
                      : "text-slate-700 focus:bg-slate-100 focus:text-slate-900"
                  )}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    학생
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/teacher" className={cn(
                    "flex items-center cursor-pointer transition-colors",
                    theme === "dark"
                      ? "text-slate-300 focus:bg-slate-700 focus:text-white"
                      : "text-slate-700 focus:bg-slate-100 focus:text-slate-900"
                  )}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    강사
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin" className={cn(
                    "flex items-center cursor-pointer transition-colors",
                    theme === "dark"
                      ? "text-slate-300 focus:bg-slate-700 focus:text-white"
                      : "text-slate-700 focus:bg-slate-100 focus:text-slate-900"
                  )}>
                    <Shield className="mr-2 h-4 w-4" />
                    관리자
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/operator" className={cn(
                    "flex items-center cursor-pointer transition-colors",
                    theme === "dark"
                      ? "text-slate-300 focus:bg-slate-700 focus:text-white"
                      : "text-slate-700 focus:bg-slate-100 focus:text-slate-900"
                  )}>
                    <Building2 className="mr-2 h-4 w-4" />
                    운영자
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(
                    "gap-2 transition-colors hover:border-violet-500",
                    theme === "dark"
                      ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                      : "bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Layers className="h-4 w-4" />
                  <span className="hidden md:inline-block">
                    {theme === "dark" ? "다크 모드" : "라이트 모드"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className={cn(
                  "w-56 transition-colors",
                  theme === "dark" 
                    ? "bg-slate-800 border-slate-700" 
                    : "bg-white border-slate-200"
                )}
              >
                <DropdownMenuLabel className={theme === "dark" ? "text-slate-200" : "text-slate-900"}>
                  테마 선택
                </DropdownMenuLabel>
                <DropdownMenuSeparator className={theme === "dark" ? "bg-slate-700" : "bg-slate-200"} />
                <DropdownMenuItem 
                  onClick={() => handleThemeChange("dark")}
                  className={cn(
                    "transition-colors",
                    theme === "dark"
                      ? "text-slate-300 focus:bg-slate-700 focus:text-white"
                      : "text-slate-700 focus:bg-slate-100 focus:text-slate-900",
                    theme === "dark" && "bg-violet-500/20 text-violet-400"
                  )}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  다크 모드
                  {theme === "dark" && (
                    <span className="ml-auto text-xs text-violet-400">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleThemeChange("light")}
                  className={cn(
                    "transition-colors",
                    theme === "dark"
                      ? "text-slate-300 focus:bg-slate-700 focus:text-white"
                      : "text-slate-700 focus:bg-slate-100 focus:text-slate-900",
                    theme === "light" && "bg-violet-500/20 text-violet-400"
                  )}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  라이트 모드
                  {theme === "light" && (
                    <span className="ml-auto text-xs text-violet-400">✓</span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "relative transition-colors",
                theme === "dark"
                  ? "text-slate-300 hover:text-white hover:bg-slate-800"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <Bell className="h-5 w-5" />
              <span className={cn(
                "absolute top-1.5 right-1.5 h-2 w-2 bg-violet-500 rounded-full ring-2",
                theme === "dark" ? "ring-slate-900" : "ring-white"
              )} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "gap-2 transition-colors",
                    theme === "dark"
                      ? "text-slate-300 hover:text-white hover:bg-slate-800"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className={cn(
                    "hidden sm:inline-block font-medium transition-colors",
                    theme === "dark" ? "text-white" : "text-slate-900"
                  )}>Operator</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className={cn(
                  "w-56 transition-colors",
                  theme === "dark" 
                    ? "bg-slate-800 border-slate-700" 
                    : "bg-white border-slate-200"
                )}
              >
                <DropdownMenuLabel className={theme === "dark" ? "text-slate-200" : "text-slate-900"}>
                  운영자 계정
                </DropdownMenuLabel>
                <DropdownMenuSeparator className={theme === "dark" ? "bg-slate-700" : "bg-slate-200"} />
                <DropdownMenuItem className={cn(
                  "transition-colors",
                  theme === "dark"
                    ? "text-slate-300 focus:bg-slate-700 focus:text-white"
                    : "text-slate-700 focus:bg-slate-100 focus:text-slate-900"
                )}>
                  <Settings className="mr-2 h-4 w-4" />
                  설정
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className={cn(
                    "transition-colors",
                    theme === "dark"
                      ? "text-slate-300 focus:bg-slate-700 focus:text-white"
                      : "text-slate-700 focus:bg-slate-100 focus:text-slate-900"
                  )}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-16 bottom-0 border-r backdrop-blur-xl transition-all duration-300 z-40",
            theme === "dark" 
              ? "border-slate-800 bg-slate-900/50" 
              : "border-slate-200 bg-white/50",
            sidebarCollapsed ? "w-16" : "w-64",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <nav className="flex flex-col gap-1 p-2 h-full overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = window.location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full h-11 transition-all duration-200 overflow-visible",
                      sidebarCollapsed ? "justify-center px-0" : "justify-start gap-3 px-3 pr-2",
                      isActive
                        ? "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 hover:text-violet-300 border-l-2 border-violet-500"
                        : theme === "dark"
                          ? "text-slate-400 hover:text-white hover:bg-slate-800/50"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium text-base whitespace-nowrap">{item.label}</span>
                        {item.hasAI && (
                          <span className="px-1.5 py-0.5 rounded-md bg-violet-500/20 border border-violet-500/30 text-[10px] font-bold text-violet-400 whitespace-nowrap flex-shrink-0">
                            AI
                          </span>
                        )}
                      </div>
                    )}
                    {!sidebarCollapsed && isActive && (
                      <ChevronRight className="h-4 w-4 ml-auto flex-shrink-0" />
                    )}
                  </Button>
                </Link>
              );
            })}

            <div className={cn(
              "mt-auto pt-4 border-t transition-colors",
              theme === "dark" ? "border-slate-800" : "border-slate-200"
            )}>
              <Button
                variant="ghost"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={cn(
                  "w-full h-10 transition-colors",
                  theme === "dark"
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                  sidebarCollapsed ? "justify-center px-0" : "justify-between px-4"
                )}
              >
                {!sidebarCollapsed && <span className="text-sm">사이드바 접기</span>}
                <ChevronRight 
                  className={cn(
                    "h-4 w-4 transition-transform",
                    sidebarCollapsed ? "rotate-0" : "rotate-180"
                  )} 
                />
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300 min-h-[calc(100vh-4rem)]",
            sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
          )}
        >
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
    </TooltipProvider>
  );
};

export default OperatorLayout;
