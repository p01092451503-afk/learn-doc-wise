import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import Landing from "./pages/Landing";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import DemoPreview from "./pages/DemoPreview";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCourses from "./pages/StudentCourses";
import StudentAssignments from "./pages/StudentAssignments";
import StudentCommunity from "./pages/StudentCommunity";
import StudentAnalytics from "./pages/StudentAnalytics";
import StudentGamification from "./pages/StudentGamification";
import StudentLearningPath from "./pages/StudentLearningPath";
import StudentLearningPathDetail from "./pages/StudentLearningPathDetail";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherCourses from "./pages/TeacherCourses";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherRevenue from "./pages/TeacherRevenue";
import TeacherAnalytics from "./pages/TeacherAnalytics";
import TeacherAssignments from "./pages/TeacherAssignments";
import TeacherAttendance from "./pages/TeacherAttendance";
import AdminDashboard from "./pages/AdminDashboard";
import OperatorDashboard from "./pages/OperatorDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminCourses from "./pages/AdminCourses";
import AdminContent from "./pages/AdminContent";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminRevenue from "./pages/AdminRevenue";
import AdminSettings from "./pages/AdminSettings";
import AdminMonitoring from "./pages/AdminMonitoring";
import AdminLearning from "./pages/AdminLearning";
import AdminAILogs from "./pages/AdminAILogs";
import AdminTemplates from "./pages/AdminTemplates";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminTrainingLog from "./pages/admin/AdminTrainingLog";
import AdminSatisfactionSurvey from "./pages/admin/AdminSatisfactionSurvey";
import AdminCounselingLog from "./pages/admin/AdminCounselingLog";
import AdminDropoutManagement from "./pages/admin/AdminDropoutManagement";
import AdminTrainingCompletion from "./pages/admin/AdminTrainingCompletion";
import AdminGrades from "./pages/admin/AdminGrades";
import AdminManual from "./pages/admin/AdminManual";
import AdminTrainingAllowance from "./pages/admin/AdminTrainingAllowance";
import TeacherTrainingLog from "./pages/teacher/TeacherTrainingLog";
import TeacherSatisfactionSurvey from "./pages/teacher/TeacherSatisfactionSurvey";
import TeacherCounselingLog from "./pages/teacher/TeacherCounselingLog";
import TeacherDropoutManagement from "./pages/teacher/TeacherDropoutManagement";
import TeacherAttendanceDetail from "./pages/teacher/TeacherAttendanceDetail";
import TeacherTrainingCompletion from "./pages/teacher/TeacherTrainingCompletion";
import TeacherTrainingAllowance from "./pages/teacher/TeacherTrainingAllowance";
import TeacherTrainingReport from "./pages/teacher/TeacherTrainingReport";
import StudentSatisfactionSurvey from "./pages/student/StudentSatisfactionSurvey";
import StudentCounselingLog from "./pages/student/StudentCounselingLog";
import TemplatePreview from "./pages/TemplatePreview";
import PublicMain from "./pages/PublicMain";
import PublicCourses from "./pages/PublicCourses";
import PublicCourseDetail from "./pages/PublicCourseDetail";
import StudentCourseDetail from "./pages/StudentCourseDetail";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import NotFound from "./pages/NotFound";
import OperatorTenants from "./pages/operator/OperatorTenants";
import OperatorUsage from "./pages/operator/OperatorUsage";
import OperatorAILogs from "./pages/operator/OperatorAILogs";
import OperatorRevenue from "./pages/operator/OperatorRevenue";
import OperatorMonitoring from "./pages/operator/OperatorMonitoring";
import OperatorSettings from "./pages/operator/OperatorSettings";
import OperatorFeatures from "./pages/operator/OperatorFeatures";
import OperatorTechStack from "./pages/operator/OperatorTechStack";
import OperatorGovernmentTraining from "./pages/operator/OperatorGovernmentTraining";
import OperatorManual from "./pages/operator/OperatorManual";
import OperatorSystemDiagram from "./pages/operator/OperatorSystemDiagram";
import OperatorBackup from "./pages/operator/OperatorBackup";
import OperatorUpdates from "./pages/operator/OperatorUpdates";
import OperatorLicense from "./pages/operator/OperatorLicense";
import OperatorResources from "./pages/operator/OperatorResources";
import FeaturesShowcase from "./pages/FeaturesShowcase";

// 페이지 전환 시 스크롤을 최상단으로 이동
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/features-detail" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/features" element={<FeaturesShowcase />} />
          <Route path="/main" element={<PublicMain />} />
          <Route path="/courses" element={<PublicCourses />} />
          <Route path="/courses/:id" element={<PublicCourseDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/demo" element={<DemoPreview />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/students" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<StudentCourses />} />
          <Route path="/student/courses/:id" element={<StudentCourseDetail />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/community" element={<StudentCommunity />} />
          <Route path="/student/analytics" element={<StudentAnalytics />} />
          <Route path="/student/gamification" element={<StudentGamification />} />
          <Route path="/student/learning-path" element={<StudentLearningPath />} />
          <Route path="/student/learning-path/:id" element={<StudentLearningPathDetail />} />
          <Route path="/student/satisfaction-survey" element={<StudentSatisfactionSurvey />} />
          <Route path="/student/counseling-log" element={<StudentCounselingLog />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/courses" element={<TeacherCourses />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/revenue" element={<TeacherRevenue />} />
          <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route path="/teacher/attendance" element={<TeacherAttendance />} />
          <Route path="/teacher/attendance-detail" element={<TeacherAttendanceDetail />} />
          <Route path="/teacher/training-log" element={<TeacherTrainingLog />} />
          <Route path="/teacher/satisfaction-survey" element={<TeacherSatisfactionSurvey />} />
          <Route path="/teacher/counseling-log" element={<TeacherCounselingLog />} />
          <Route path="/teacher/dropout-management" element={<TeacherDropoutManagement />} />
          <Route path="/teacher/training-completion" element={<TeacherTrainingCompletion />} />
          <Route path="/teacher/training-allowance" element={<TeacherTrainingAllowance />} />
          <Route path="/teacher/training-report" element={<TeacherTrainingReport />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/operator" element={<OperatorDashboard />} />
          <Route path="/operator/tenants" element={<OperatorTenants />} />
          <Route path="/operator/usage" element={<OperatorUsage />} />
          <Route path="/operator/ai-logs" element={<OperatorAILogs />} />
          <Route path="/operator/revenue" element={<OperatorRevenue />} />
          <Route path="/operator/monitoring" element={<OperatorMonitoring />} />
          <Route path="/operator/settings" element={<OperatorSettings />} />
          <Route path="/operator/features" element={<OperatorFeatures />} />
          <Route path="/operator/tech-stack" element={<OperatorTechStack />} />
          <Route path="/operator/government-training" element={<OperatorGovernmentTraining />} />
          <Route path="/operator/manual" element={<OperatorManual />} />
          <Route path="/operator/system-diagram" element={<OperatorSystemDiagram />} />
          <Route path="/operator/backup" element={<OperatorBackup />} />
          <Route path="/operator/updates" element={<OperatorUpdates />} />
          <Route path="/operator/license" element={<OperatorLicense />} />
          <Route path="/operator/resources" element={<OperatorResources />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/content" element={<AdminContent />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/training-log" element={<AdminTrainingLog />} />
          <Route path="/admin/satisfaction-survey" element={<AdminSatisfactionSurvey />} />
          <Route path="/admin/counseling-log" element={<AdminCounselingLog />} />
          <Route path="/admin/dropout-management" element={<AdminDropoutManagement />} />
          <Route path="/admin/training-completion" element={<AdminTrainingCompletion />} />
          <Route path="/admin/grades" element={<AdminGrades />} />
          <Route path="/admin/training-allowance" element={<AdminTrainingAllowance />} />
          <Route path="/admin/manual" element={<AdminManual />} />
          <Route path="/admin/revenue" element={<AdminRevenue />} />
          <Route path="/admin/monitoring" element={<AdminMonitoring />} />
          <Route path="/admin/learning" element={<AdminLearning />} />
          <Route path="/admin/ai-logs" element={<AdminAILogs />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/fail" element={<PaymentFail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
  );
};

export default App;
