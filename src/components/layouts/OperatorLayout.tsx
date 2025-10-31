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
  { icon: Building2, label: "고객사", path: "/operator/tenants" },
  { icon: BarChart3, label: "사용량", path: "/operator/usage" },
  { icon: Brain, label: "AI 로그", path: "/operator/ai-logs", hasAI: true },
  { icon: DollarSign, label: "매출", path: "/operator/revenue" },
  { icon: Shield, label: "모니터링", path: "/operator/monitoring" },
  { icon: Settings, label: "설정", path: "/operator/settings" },
];

const OperatorLayout = ({ children }: OperatorLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("operator-sidebar-collapsed");
    return saved === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("operator-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

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
    <div className="min-h-screen bg-slate-950">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link to="/operator" className="flex items-center gap-2 group">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <img src={logoIcon} alt="Logo" className="h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-white">atomLMS</span>
                <span className="ml-2 text-xs font-medium text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">Operator</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="검색..."
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-violet-500 rounded-full ring-2 ring-slate-900" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:inline-block font-medium text-white">Operator</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                <DropdownMenuLabel className="text-slate-200">운영자 계정</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-white">
                  <Settings className="mr-2 h-4 w-4" />
                  설정
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-slate-300 focus:bg-slate-700 focus:text-white"
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
            "fixed left-0 top-16 bottom-0 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl transition-all duration-300 z-40",
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
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium text-base whitespace-nowrap">{item.label}</span>
                        {item.hasAI && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-violet-500/20 border border-violet-500/30 flex-shrink-0">
                            <img src={aiRobotBadge} alt="AI" className="h-3 w-3" />
                            <span className="text-[10px] font-semibold text-violet-400 whitespace-nowrap">AI</span>
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

            <div className="mt-auto pt-4 border-t border-slate-800">
              <Button
                variant="ghost"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={cn(
                  "w-full h-10 text-slate-400 hover:text-white hover:bg-slate-800/50",
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
  );
};

export default OperatorLayout;
