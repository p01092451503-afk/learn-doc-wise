import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: "student" | "teacher" | "admin";
  isDemo?: boolean;
}

const DashboardLayout = ({ children, userRole, isDemo = false }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const getMenuItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: "대시보드", path: `/${userRole}`, enabled: true },
    ];

    if (userRole === "student") {
      return [
        ...baseItems,
        { icon: BookOpen, label: "내 강의", path: "#", enabled: false },
        { icon: FileText, label: "과제", path: "#", enabled: false },
        { icon: MessageSquare, label: "커뮤니티", path: "#", enabled: false },
        { icon: BarChart3, label: "학습 통계", path: "#", enabled: false },
      ];
    }

    if (userRole === "teacher") {
      return [
        ...baseItems,
        { icon: BookOpen, label: "강의 관리", path: "#", enabled: false },
        { icon: FileText, label: "과제 관리", path: "#", enabled: false },
        { icon: Users, label: "학생 관리", path: "#", enabled: false },
        { icon: BarChart3, label: "통계", path: "#", enabled: false },
        { icon: DollarSign, label: "수익", path: "#", enabled: false },
      ];
    }

    // admin
    return [
      ...baseItems,
      { icon: Users, label: "사용자 관리", path: "#", enabled: false },
      { icon: BookOpen, label: "강좌 관리", path: "#", enabled: false },
      { icon: FolderOpen, label: "콘텐츠 관리", path: "#", enabled: false },
      { icon: BarChart3, label: "분석", path: "#", enabled: false },
      { icon: DollarSign, label: "매출 관리", path: "#", enabled: false },
      { icon: Settings, label: "시스템 설정", path: "#", enabled: false },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - Hidden in demo mode */}
      {!isDemo && (
        <header className="sticky top-0 z-40 border-b bg-background/98 backdrop-blur-xl supports-[backdrop-filter]:bg-background/95 shadow-sm">
        <div className="flex h-20 items-center gap-4 px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden rounded-xl"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link to="/" className="flex items-center gap-3 font-semibold group">
            <div className="relative">
              <GraduationCap className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="hidden sm:inline-block font-display text-xl">
              <span className="text-gradient">WebHeads</span>{" "}
              <span className="text-foreground font-semibold">LMS</span>
            </span>
          </Link>

          <div className="flex-1 flex items-center gap-4 ml-4">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="강의, 과제 검색..."
                className="pl-12 h-11 rounded-xl border-border/50 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-primary/10">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full ring-2 ring-background" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 rounded-xl hover:bg-primary/10">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-premium">
                    <span className="text-sm font-semibold text-primary-foreground">홍</span>
                  </div>
                  <span className="hidden sm:inline-block font-medium">홍길동</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/50">
                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg">
                  <Settings className="mr-2 h-4 w-4" />
                  설정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/")} className="rounded-lg">
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
            "fixed z-30 border-r bg-background/98 backdrop-blur-xl transition-transform duration-300",
            isDemo ? "left-0 top-0 h-screen w-72" : "left-0 top-20 h-[calc(100vh-5rem)] w-72",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "md:translate-x-0"
          )}
        >
          <nav className="flex flex-col gap-1.5 p-4">
            {menuItems.map((item) => (
              item.enabled ? (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-primary/10 hover:text-primary hover:shadow-sm transition-all duration-300"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                </Link>
              ) : (
                <div key={item.label} className="relative">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 rounded-xl opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    준비중
                  </span>
                </div>
              )
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 p-8 transition-all duration-300",
            sidebarOpen ? "md:ml-72" : "md:ml-0"
          )}
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* AI Chatbot Button - Hidden in demo mode */}
      {!isDemo && (
        <Button
          size="icon"
          variant="premium"
          className="fixed bottom-8 right-8 h-16 w-16 rounded-2xl shadow-glow hover:shadow-elegant hover:scale-110 transition-all duration-300 z-50"
        >
          <MessageSquare className="h-7 w-7" />
        </Button>
      )}
    </div>
  );
};

export default DashboardLayout;
