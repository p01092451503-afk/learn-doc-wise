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
}

const DashboardLayout = ({ children, userRole }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const getMenuItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: "대시보드", path: `/${userRole}` },
    ];

    if (userRole === "student") {
      return [
        ...baseItems,
        { icon: BookOpen, label: "내 강의", path: "/student/courses" },
        { icon: FileText, label: "과제", path: "/student/assignments" },
        { icon: MessageSquare, label: "커뮤니티", path: "/student/community" },
        { icon: BarChart3, label: "학습 통계", path: "/student/analytics" },
      ];
    }

    if (userRole === "teacher") {
      return [
        ...baseItems,
        { icon: BookOpen, label: "강의 관리", path: "/teacher/courses" },
        { icon: FileText, label: "과제 관리", path: "/teacher/assignments" },
        { icon: Users, label: "학생 관리", path: "/teacher/students" },
        { icon: BarChart3, label: "통계", path: "/teacher/analytics" },
        { icon: DollarSign, label: "수익", path: "/teacher/revenue" },
      ];
    }

    // admin
    return [
      ...baseItems,
      { icon: Users, label: "사용자 관리", path: "/admin/users" },
      { icon: BookOpen, label: "강좌 관리", path: "/admin/courses" },
      { icon: FolderOpen, label: "콘텐츠 관리", path: "/admin/content" },
      { icon: BarChart3, label: "분석", path: "/admin/analytics" },
      { icon: DollarSign, label: "매출 관리", path: "/admin/revenue" },
      { icon: Settings, label: "시스템 설정", path: "/admin/settings" },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link to="/" className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline-block">WebHeads LMS</span>
          </Link>

          <div className="flex-1 flex items-center gap-4 ml-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="강의, 과제 검색..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">홍</span>
                  </div>
                  <span className="hidden sm:inline-block">홍길동</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  설정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/")}>
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "md:translate-x-0"
          )}
        >
          <nav className="flex flex-col gap-2 p-4">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 hover:bg-primary/10 hover:text-primary"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 p-6 transition-all duration-300",
            sidebarOpen ? "md:ml-64" : "md:ml-0"
          )}
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* AI Chatbot Button */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default DashboardLayout;
