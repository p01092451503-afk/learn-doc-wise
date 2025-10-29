import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
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
    switch (activeRole) {
      case "student":
        return <StudentDashboard />;
      case "teacher":
        return <TeacherDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Mode Header */}
      <div className="border-b sticky top-0 bg-background/98 backdrop-blur-xl z-[60] shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">WebHeads LMS</span>
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
        {/* Info Banner - Fixed below header */}
        <div className="fixed top-20 left-0 right-0 bg-primary/10 border-b border-primary/20 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-3.5">
            <p className="text-sm text-center font-medium">
              💡 <strong>{activeRole === "student" ? "학생" : activeRole === "teacher" ? "강사" : "관리자"}</strong> 
              {" "}대시보드의 모든 기능을 자유롭게 체험해보세요. 실제 작동하는 UI로 구성되어 있습니다.
            </p>
          </div>
        </div>

        {/* Dashboard with proper spacing */}
        <div className="pt-[60px]">
          {renderDashboard()}
        </div>
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link to="/auth">
          <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
            실제 서비스 시작하기
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DemoPreview;
