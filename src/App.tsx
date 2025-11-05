import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { UserProvider } from "./contexts/UserContext";
import { DashboardSkeleton } from "./components/LoadingSkeleton";

// Lazy load all pages for better performance
const Landing = lazy(() => import("./pages/Landing"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Auth = lazy(() => import("./pages/Auth"));
const DemoPreview = lazy(() => import("./pages/DemoPreview"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StudentCourses = lazy(() => import("./pages/StudentCourses"));
const StudentAssignments = lazy(() => import("./pages/StudentAssignments"));
const StudentCommunity = lazy(() => import("./pages/StudentCommunity"));
const StudentAnalytics = lazy(() => import("./pages/StudentAnalytics"));
const StudentGamification = lazy(() => import("./pages/StudentGamification"));
const StudentLearningPath = lazy(() => import("./pages/StudentLearningPath"));
const StudentLearningPathDetail = lazy(() => import("./pages/StudentLearningPathDetail"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const TeacherCourses = lazy(() => import("./pages/TeacherCourses"));
const TeacherStudents = lazy(() => import("./pages/TeacherStudents"));
const TeacherRevenue = lazy(() => import("./pages/TeacherRevenue"));
const TeacherAnalytics = lazy(() => import("./pages/TeacherAnalytics"));
const TeacherAssignments = lazy(() => import("./pages/TeacherAssignments"));
const TeacherAttendance = lazy(() => import("./pages/TeacherAttendance"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const OperatorDashboard = lazy(() => import("./pages/OperatorDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminCourses = lazy(() => import("./pages/AdminCourses"));
const AdminCoursesIntegrated = lazy(() => import("./pages/AdminCoursesIntegrated"));
const AdminContent = lazy(() => import("./pages/AdminContent"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminRevenue = lazy(() => import("./pages/AdminRevenue"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminMonitoring = lazy(() => import("./pages/AdminMonitoring"));
const AdminLearning = lazy(() => import("./pages/AdminLearning"));
const AdminAILogs = lazy(() => import("./pages/AdminAILogs"));
const AdminTemplates = lazy(() => import("./pages/AdminTemplates"));
const AdminAttendance = lazy(() => import("./pages/admin/AdminAttendance"));
const AdminTrainingLog = lazy(() => import("./pages/admin/AdminTrainingLog"));
const AdminSatisfactionSurvey = lazy(() => import("./pages/admin/AdminSatisfactionSurvey"));
const AdminCounselingLog = lazy(() => import("./pages/admin/AdminCounselingLog"));
const AdminDropoutManagement = lazy(() => import("./pages/admin/AdminDropoutManagement"));
const AdminTrainingCompletion = lazy(() => import("./pages/admin/AdminTrainingCompletion"));
const AdminGrades = lazy(() => import("./pages/admin/AdminGrades"));
const AdminManual = lazy(() => import("./pages/admin/AdminManual"));
const AdminTrainingAllowance = lazy(() => import("./pages/admin/AdminTrainingAllowance"));
const TeacherTrainingLog = lazy(() => import("./pages/teacher/TeacherTrainingLog"));
const TeacherSatisfactionSurvey = lazy(() => import("./pages/teacher/TeacherSatisfactionSurvey"));
const TeacherCounselingLog = lazy(() => import("./pages/teacher/TeacherCounselingLog"));
const TeacherDropoutManagement = lazy(() => import("./pages/teacher/TeacherDropoutManagement"));
const TeacherAttendanceDetail = lazy(() => import("./pages/teacher/TeacherAttendanceDetail"));
const TeacherTrainingCompletion = lazy(() => import("./pages/teacher/TeacherTrainingCompletion"));
const TeacherTrainingAllowance = lazy(() => import("./pages/teacher/TeacherTrainingAllowance"));
const TeacherTrainingReport = lazy(() => import("./pages/teacher/TeacherTrainingReport"));
const StudentSatisfactionSurvey = lazy(() => import("./pages/student/StudentSatisfactionSurvey"));
const StudentCounselingLog = lazy(() => import("./pages/student/StudentCounselingLog"));
const TeacherCourseDetail = lazy(() => import("./pages/TeacherCourseDetail"));
const TemplatePreview = lazy(() => import("./pages/TemplatePreview"));
const PublicMain = lazy(() => import("./pages/PublicMain"));
const PublicCourses = lazy(() => import("./pages/PublicCourses"));
const PublicCourseDetail = lazy(() => import("./pages/PublicCourseDetail"));
const StudentCourseDetail = lazy(() => import("./pages/StudentCourseDetail"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFail = lazy(() => import("./pages/PaymentFail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OperatorTenants = lazy(() => import("./pages/operator/OperatorTenants"));
const OperatorUsage = lazy(() => import("./pages/operator/OperatorUsage"));
const OperatorAILogs = lazy(() => import("./pages/operator/OperatorAILogs"));
const OperatorRevenue = lazy(() => import("./pages/operator/OperatorRevenue"));
const OperatorMonitoring = lazy(() => import("./pages/operator/OperatorMonitoring"));
const OperatorSettings = lazy(() => import("./pages/operator/OperatorSettings"));
const OperatorFeatures = lazy(() => import("./pages/operator/OperatorFeatures"));
const OperatorTechStack = lazy(() => import("./pages/operator/OperatorTechStack"));
const OperatorGovernmentTraining = lazy(() => import("./pages/operator/OperatorGovernmentTraining"));
const OperatorManual = lazy(() => import("./pages/operator/OperatorManual"));
const OperatorSystemDiagram = lazy(() => import("./pages/operator/OperatorSystemDiagram"));
const OperatorBackup = lazy(() => import("./pages/operator/OperatorBackup"));
const OperatorUpdates = lazy(() => import("./pages/operator/OperatorUpdates"));
const OperatorLicense = lazy(() => import("./pages/operator/OperatorLicense"));
const OperatorResources = lazy(() => import("./pages/operator/OperatorResources"));
const FeaturesShowcase = lazy(() => import("./pages/FeaturesShowcase"));
const AdminDemo = lazy(() => import("./pages/AdminDemo"));
const TenantHome = lazy(() => import("./pages/TenantHome"));
const TenantCourses = lazy(() => import("./pages/TenantCourses"));
const TenantCourseDetail = lazy(() => import("./pages/TenantCourseDetail"));

// Loading component with better skeleton
const LoadingFallback = () => <DashboardSkeleton />;

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
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={<div className="animate-fade-in"><LoadingFallback /></div>}>
              <Routes>
                <Route key="landing" path="/" element={<div className="animate-fade-in"><Landing /></div>} />
                <Route key="features-detail" path="/features-detail" element={<div className="animate-fade-in"><Features /></div>} />
                <Route key="pricing" path="/pricing" element={<div className="animate-fade-in"><Pricing /></div>} />
                <Route key="features" path="/features" element={<div className="animate-fade-in"><FeaturesShowcase /></div>} />
                <Route key="main" path="/main" element={<div className="animate-fade-in"><PublicMain /></div>} />
                <Route key="courses" path="/courses" element={<div className="animate-fade-in"><PublicCourses /></div>} />
                <Route key="course-detail" path="/courses/:id" element={<div className="animate-fade-in"><PublicCourseDetail /></div>} />
                <Route key="auth" path="/auth" element={<div className="animate-fade-in"><Auth /></div>} />
                <Route key="demo" path="/demo" element={<div className="animate-fade-in"><DemoPreview /></div>} />
                <Route key="admin-demo" path="/admin-demo" element={<div className="animate-fade-in"><AdminDemo /></div>} />
                <Route key="student" path="/student" element={<div className="animate-fade-in"><StudentDashboard /></div>} />
                <Route key="students" path="/students" element={<div className="animate-fade-in"><StudentDashboard /></div>} />
                <Route key="student-courses" path="/student/courses" element={<div className="animate-fade-in"><StudentCourses /></div>} />
                <Route key="student-course-detail" path="/student/courses/:id" element={<div className="animate-fade-in"><StudentCourseDetail /></div>} />
                <Route key="student-assignments" path="/student/assignments" element={<div className="animate-fade-in"><StudentAssignments /></div>} />
                <Route key="student-community" path="/student/community" element={<div className="animate-fade-in"><StudentCommunity /></div>} />
                <Route key="student-analytics" path="/student/analytics" element={<div className="animate-fade-in"><StudentAnalytics /></div>} />
                <Route key="student-gamification" path="/student/gamification" element={<div className="animate-fade-in"><StudentGamification /></div>} />
                <Route key="student-learning-path" path="/student/learning-path" element={<div className="animate-fade-in"><StudentLearningPath /></div>} />
                <Route key="student-learning-path-detail" path="/student/learning-path/:id" element={<div className="animate-fade-in"><StudentLearningPathDetail /></div>} />
                <Route key="student-satisfaction" path="/student/satisfaction-survey" element={<div className="animate-fade-in"><StudentSatisfactionSurvey /></div>} />
                <Route key="student-counseling" path="/student/counseling-log" element={<div className="animate-fade-in"><StudentCounselingLog /></div>} />
                <Route key="teacher" path="/teacher" element={<div className="animate-fade-in"><TeacherDashboard /></div>} />
                <Route key="teacher-courses" path="/teacher/courses" element={<div className="animate-fade-in"><TeacherCourses /></div>} />
                <Route key="teacher-course-detail" path="/teacher/courses/:id" element={<div className="animate-fade-in"><TeacherCourseDetail /></div>} />
                <Route key="teacher-students" path="/teacher/students" element={<div className="animate-fade-in"><TeacherStudents /></div>} />
                <Route key="teacher-revenue" path="/teacher/revenue" element={<div className="animate-fade-in"><TeacherRevenue /></div>} />
                <Route key="teacher-analytics" path="/teacher/analytics" element={<div className="animate-fade-in"><TeacherAnalytics /></div>} />
                <Route key="teacher-assignments" path="/teacher/assignments" element={<div className="animate-fade-in"><TeacherAssignments /></div>} />
                <Route key="teacher-attendance" path="/teacher/attendance" element={<div className="animate-fade-in"><TeacherAttendance /></div>} />
                <Route key="teacher-attendance-detail" path="/teacher/attendance-detail" element={<div className="animate-fade-in"><TeacherAttendanceDetail /></div>} />
                <Route key="teacher-training-log" path="/teacher/training-log" element={<div className="animate-fade-in"><TeacherTrainingLog /></div>} />
                <Route key="teacher-satisfaction" path="/teacher/satisfaction-survey" element={<div className="animate-fade-in"><TeacherSatisfactionSurvey /></div>} />
                <Route key="teacher-counseling" path="/teacher/counseling-log" element={<div className="animate-fade-in"><TeacherCounselingLog /></div>} />
                <Route key="teacher-dropout" path="/teacher/dropout-management" element={<div className="animate-fade-in"><TeacherDropoutManagement /></div>} />
                <Route key="teacher-completion" path="/teacher/training-completion" element={<div className="animate-fade-in"><TeacherTrainingCompletion /></div>} />
                <Route key="teacher-allowance" path="/teacher/training-allowance" element={<div className="animate-fade-in"><TeacherTrainingAllowance /></div>} />
                <Route key="teacher-report" path="/teacher/training-report" element={<div className="animate-fade-in"><TeacherTrainingReport /></div>} />
                <Route key="admin" path="/admin" element={<div className="animate-fade-in"><AdminDashboard /></div>} />
                <Route key="operator" path="/operator" element={<div className="animate-fade-in"><OperatorDashboard /></div>} />
                <Route key="operator-tenants" path="/operator/tenants" element={<div className="animate-fade-in"><OperatorTenants /></div>} />
                <Route key="operator-usage" path="/operator/usage" element={<div className="animate-fade-in"><OperatorUsage /></div>} />
                <Route key="operator-ai-logs" path="/operator/ai-logs" element={<div className="animate-fade-in"><OperatorAILogs /></div>} />
                <Route key="operator-revenue" path="/operator/revenue" element={<div className="animate-fade-in"><OperatorRevenue /></div>} />
                <Route key="operator-monitoring" path="/operator/monitoring" element={<div className="animate-fade-in"><OperatorMonitoring /></div>} />
                <Route key="operator-settings" path="/operator/settings" element={<div className="animate-fade-in"><OperatorSettings /></div>} />
                <Route key="operator-features" path="/operator/features" element={<div className="animate-fade-in"><OperatorFeatures /></div>} />
                <Route key="operator-tech-stack" path="/operator/tech-stack" element={<div className="animate-fade-in"><OperatorTechStack /></div>} />
                <Route key="operator-govt-training" path="/operator/government-training" element={<div className="animate-fade-in"><OperatorGovernmentTraining /></div>} />
                <Route key="operator-manual" path="/operator/manual" element={<div className="animate-fade-in"><OperatorManual /></div>} />
                <Route key="operator-system-diagram" path="/operator/system-diagram" element={<div className="animate-fade-in"><OperatorSystemDiagram /></div>} />
                <Route key="operator-backup" path="/operator/backup" element={<div className="animate-fade-in"><OperatorBackup /></div>} />
                <Route key="operator-updates" path="/operator/updates" element={<div className="animate-fade-in"><OperatorUpdates /></div>} />
                <Route key="operator-license" path="/operator/license" element={<div className="animate-fade-in"><OperatorLicense /></div>} />
                <Route key="operator-resources" path="/operator/resources" element={<div className="animate-fade-in"><OperatorResources /></div>} />
          <Route key="admin-users" path="/admin/users" element={<div className="animate-fade-in"><AdminUsers /></div>} />
          <Route key="admin-courses" path="/admin/courses" element={<div className="animate-fade-in"><AdminCoursesIntegrated /></div>} />
          <Route key="admin-content" path="/admin/content" element={<div className="animate-fade-in"><AdminContent /></div>} />
                <Route key="admin-attendance" path="/admin/attendance" element={<div className="animate-fade-in"><AdminAttendance /></div>} />
                <Route key="admin-training-log" path="/admin/training-log" element={<div className="animate-fade-in"><AdminTrainingLog /></div>} />
                <Route key="admin-satisfaction" path="/admin/satisfaction-survey" element={<div className="animate-fade-in"><AdminSatisfactionSurvey /></div>} />
                <Route key="admin-counseling" path="/admin/counseling-log" element={<div className="animate-fade-in"><AdminCounselingLog /></div>} />
                <Route key="admin-dropout" path="/admin/dropout-management" element={<div className="animate-fade-in"><AdminDropoutManagement /></div>} />
                <Route key="admin-completion" path="/admin/training-completion" element={<div className="animate-fade-in"><AdminTrainingCompletion /></div>} />
                <Route key="admin-grades" path="/admin/grades" element={<div className="animate-fade-in"><AdminGrades /></div>} />
                <Route key="admin-allowance" path="/admin/training-allowance" element={<div className="animate-fade-in"><AdminTrainingAllowance /></div>} />
                <Route key="admin-manual" path="/admin/manual" element={<div className="animate-fade-in"><AdminManual /></div>} />
                <Route key="admin-revenue" path="/admin/revenue" element={<div className="animate-fade-in"><AdminRevenue /></div>} />
                <Route key="admin-monitoring" path="/admin/monitoring" element={<div className="animate-fade-in"><AdminMonitoring /></div>} />
                <Route key="admin-learning" path="/admin/learning" element={<div className="animate-fade-in"><AdminLearning /></div>} />
                <Route key="admin-ai-logs" path="/admin/ai-logs" element={<div className="animate-fade-in"><AdminAILogs /></div>} />
                <Route key="admin-analytics" path="/admin/analytics" element={<div className="animate-fade-in"><AdminAnalytics /></div>} />
                <Route key="admin-settings" path="/admin/settings" element={<div className="animate-fade-in"><AdminSettings /></div>} />
                <Route key="payment-success" path="/payment/success" element={<div className="animate-fade-in"><PaymentSuccess /></div>} />
                <Route key="payment-fail" path="/payment/fail" element={<div className="animate-fade-in"><PaymentFail /></div>} />
                <Route key="tenant-home" path="/tenant/:subdomain" element={<div className="animate-fade-in"><TenantHome /></div>} />
                <Route key="tenant-courses" path="/tenant/:subdomain/courses" element={<div className="animate-fade-in"><TenantCourses /></div>} />
                <Route key="tenant-course-detail" path="/tenant/:subdomain/courses/:courseSlug" element={<div className="animate-fade-in"><TenantCourseDetail /></div>} />
                <Route key="not-found" path="*" element={<div className="animate-fade-in"><NotFound /></div>} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
      </UserProvider>
    </QueryClientProvider>
  );
};

export default App;
