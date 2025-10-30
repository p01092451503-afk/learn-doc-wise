import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";
import { Link } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";

import StudentDashboard from "./StudentDashboard";
import StudentCourses from "./StudentCourses";
import StudentAssignments from "./StudentAssignments";
import StudentCommunity from "./StudentCommunity";
import StudentAnalytics from "./StudentAnalytics";
import TeacherDashboard from "./TeacherDashboard";
import TeacherCourses from "./TeacherCourses";
import TeacherAssignments from "./TeacherAssignments";
import TeacherStudents from "./TeacherStudents";
import TeacherAnalytics from "./TeacherAnalytics";
import TeacherRevenue from "./TeacherRevenue";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminCourses from "./AdminCourses";
import AdminContent from "./AdminContent";
import AdminLearning from "./AdminLearning";
import AdminTenants from "./AdminTenants";
import AdminRevenue from "./AdminRevenue";
import AdminUsageManagement from "./AdminUsageManagement";
import AdminAILogs from "./AdminAILogs";
import AdminMonitoring from "./AdminMonitoring";
import AdminSettings from "./AdminSettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DemoRole = "student" | "teacher" | "admin";

const DemoPreview = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeRole = (searchParams.get("role") as DemoRole) || "student";
  const activePage = searchParams.get("page") || "dashboard";

  const setActiveRole = (role: DemoRole) => {
    setSearchParams({ role, page: "dashboard" });
  };

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
        case "tenants":
          return <AdminTenants />;
        case "revenue":
          return <AdminRevenue />;
        case "usage":
          return <AdminUsageManagement />;
        case "ai-logs":
          return <AdminAILogs />;
        case "monitoring":
          return <AdminMonitoring />;
        case "settings":
          return <AdminSettings />;
        default:
          return <AdminDashboard isDemo={true} />;
      }
    }
    
    return <StudentDashboard isDemo={true} />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Mode Header */}
      <div className="border-b sticky top-0 bg-background/98 backdrop-blur-xl z-[60] shadow-sm">
        <div className="container mx-auto px-3 md:px-4 h-16 md:h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
            <Link to="/" className="flex items-center gap-1.5 md:gap-2">
              <img src={logoIcon} alt="Logo" className="h-9 w-9 md:h-12 md:w-12" />
              <span className="text-lg md:text-2xl font-logo font-bold text-foreground tracking-tight">atomLMS</span>
            </Link>
            <Button variant="secondary" size="sm" className="text-xs hidden sm:inline-flex gap-1.5 pointer-events-none">
              <Bot className="h-3.5 w-3.5" />
              데모 모드
            </Button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
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

      {/* Dashboard Content */}
      <div className="relative">
        {/* Info Banner - Static below header */}
        <div className="bg-primary/10 border-b border-primary/20 shadow-sm">
          <div className="container mx-auto px-3 md:px-4 py-2.5 md:py-3.5">
            <p className="text-xs md:text-sm text-center font-medium">
              💡 <strong>{activeRole === "student" ? "학생" : activeRole === "teacher" ? "강사" : "관리자"}</strong> 
              {" "}대시보드를 <span className="hidden sm:inline">자유롭게 </span>체험해보세요<span className="hidden md:inline">. 실제 작동하는 UI로 구성되어 있습니다</span>
            </p>
          </div>
        </div>

        {/* Dashboard */}
        <div>
          {renderContent()}
        </div>
      </div>

      {/* Floating CTA - Positioned to avoid overlap */}
      <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-xs md:max-w-none md:w-auto">
        <Link to="/auth?from=demo" className="block">
          <Button size="lg" variant="gold" className="w-full md:w-auto shadow-glow hover:shadow-elegant transition-all text-sm md:text-base">
            실제 서비스 시작하기
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DemoPreview;
