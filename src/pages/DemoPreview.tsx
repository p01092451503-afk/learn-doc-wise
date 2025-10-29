import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";
import { Link } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";

import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
import AdminDashboard from "./AdminDashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DemoRole = "student" | "teacher" | "admin";

const DemoPreview = () => {
  const [activeRole, setActiveRole] = useState<DemoRole>("student");

  const renderDashboard = () => {
    // Pass isDemo prop to prevent header/chatbot conflicts
    const demoProps = { isDemo: true };
    
    switch (activeRole) {
      case "student":
        return <StudentDashboard {...demoProps} />;
      case "teacher":
        return <TeacherDashboard {...demoProps} />;
      case "admin":
        return <AdminDashboard {...demoProps} />;
      default:
        return <StudentDashboard {...demoProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Mode Header */}
      <div className="border-b sticky top-0 bg-background/98 backdrop-blur-xl z-[60] shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoIcon} alt="Logo" className="h-12 w-12" />
              <span className="text-2xl font-logo font-bold text-foreground tracking-tight">atomLMS</span>
            </Link>
            <Badge variant="secondary" className="text-xs">
              데모 모드
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">역할 전환:</span>
              <Select value={activeRole} onValueChange={(value) => setActiveRole(value as DemoRole)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">학생</SelectItem>
                  <SelectItem value="teacher">강사</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Link to="/auth">
              <Button size="sm">회원가입</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="relative">
        {/* Info Banner - Static below header */}
        <div className="bg-primary/10 border-b border-primary/20 shadow-sm">
          <div className="container mx-auto px-4 py-3.5">
            <p className="text-sm text-center font-medium">
              💡 <strong>{activeRole === "student" ? "학생" : activeRole === "teacher" ? "강사" : "관리자"}</strong> 
              {" "}대시보드의 모든 기능을 자유롭게 체험해보세요. 실제 작동하는 UI로 구성되어 있습니다.
            </p>
          </div>
        </div>

        {/* Dashboard */}
        <div>
          {renderDashboard()}
        </div>
      </div>

      {/* Floating CTA - Positioned to avoid overlap */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Link to="/auth">
          <Button size="lg" variant="gold" className="shadow-glow hover:shadow-elegant transition-all">
            실제 서비스 시작하기
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DemoPreview;
