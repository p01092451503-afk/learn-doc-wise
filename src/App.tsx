import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Landing from "./pages/Landing"; // Eager import
import Auth from "./pages/Auth"; // Eager import - critical for auth flow
import StudentDashboard from "./pages/StudentDashboard"; // Eager import - frequently accessed
import TeacherDashboard from "./pages/TeacherDashboard"; // Eager import - frequently accessed  
import AdminDashboard from "./pages/AdminDashboard"; // Eager import - frequently accessed
import OperatorDashboard from "./pages/OperatorDashboard"; // Eager import - frequently accessed

// Lazy load less critical pages for better performance
const Main2 = lazy(() => import("./pages/Main2"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const DemoPreview = lazy(() => import("./pages/DemoPreview"));
const StudentCourses = lazy(() => import("./pages/StudentCourses"));
const StudentAssignments = lazy(() => import("./pages/StudentAssignments"));
const StudentCommunity = lazy(() => import("./pages/StudentCommunity"));
const StudentAnalytics = lazy(() => import("./pages/StudentAnalytics"));
const StudentGamification = lazy(() => import("./pages/StudentGamification"));
const StudentLearningPath = lazy(() => import("./pages/StudentLearningPath"));
const StudentLearningPathDetail = lazy(() => import("./pages/StudentLearningPathDetail"));
const TeacherCourses = lazy(() => import("./pages/TeacherCourses"));
const TeacherStudents = lazy(() => import("./pages/TeacherStudents"));
const TeacherRevenue = lazy(() => import("./pages/TeacherRevenue"));
const TeacherAnalytics = lazy(() => import("./pages/TeacherAnalytics"));
const TeacherAssignments = lazy(() => import("./pages/TeacherAssignments"));
const TeacherAttendance = lazy(() => import("./pages/TeacherAttendance"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminCourses = lazy(() => import("./pages/AdminCourses"));
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
const AdminDemoApproval = lazy(() => import("./pages/admin/AdminDemoApproval"));
const OperatorDemoApproval = lazy(() => import("./pages/operator/OperatorDemoApproval"));
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
const TenantHome = lazy(() => import("./pages/TenantHome"));
const TenantCourses = lazy(() => import("./pages/TenantCourses"));
const TenantCourseDetail = lazy(() => import("./pages/TenantCourseDetail"));

// Loading component with better visibility
const LoadingFallback = () => {
  console.log('[LoadingFallback] Rendering loading state');
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
      <p className="text-muted-foreground text-lg">로딩 중...</p>
    </div>
  );
};

// 페이지 전환 시 스크롤을 최상단으로 이동
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  console.log('[App] Initializing...');

  const [queryClient] = useState(() => {
    console.log('[App] Creating QueryClient');
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          gcTime: 10 * 60 * 1000,
          retry: 1,
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
          networkMode: 'offlineFirst',
        },
        mutations: {
          retry: 1,
          networkMode: 'offlineFirst',
        },
      },
    });
  });

  console.log('[App] Rendering App component');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider delayDuration={200}>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/main" element={<Suspense fallback={<LoadingFallback />}><PublicMain /></Suspense>} />
              <Route path="/features-detail" element={<Suspense fallback={<LoadingFallback />}><Features /></Suspense>} />
              <Route path="/pricing" element={<Suspense fallback={<LoadingFallback />}><Pricing /></Suspense>} />
              <Route path="/features" element={<Suspense fallback={<LoadingFallback />}><FeaturesShowcase /></Suspense>} />
              <Route path="/courses" element={<Suspense fallback={<LoadingFallback />}><PublicCourses /></Suspense>} />
              <Route path="/courses/:id" element={<Suspense fallback={<LoadingFallback />}><PublicCourseDetail /></Suspense>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/demo" element={<Suspense fallback={<LoadingFallback />}><DemoPreview /></Suspense>} />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/students" element={<StudentDashboard />} />
              <Route path="/student/courses" element={<Suspense fallback={<LoadingFallback />}><StudentCourses /></Suspense>} />
              <Route path="/student/courses/:id" element={<Suspense fallback={<LoadingFallback />}><StudentCourseDetail /></Suspense>} />
              <Route path="/student/assignments" element={<Suspense fallback={<LoadingFallback />}><StudentAssignments /></Suspense>} />
              <Route path="/student/community" element={<Suspense fallback={<LoadingFallback />}><StudentCommunity /></Suspense>} />
              <Route path="/student/analytics" element={<Suspense fallback={<LoadingFallback />}><StudentAnalytics /></Suspense>} />
              <Route path="/student/gamification" element={<Suspense fallback={<LoadingFallback />}><StudentGamification /></Suspense>} />
              <Route path="/student/learning-path" element={<Suspense fallback={<LoadingFallback />}><StudentLearningPath /></Suspense>} />
              <Route path="/student/learning-path/:id" element={<Suspense fallback={<LoadingFallback />}><StudentLearningPathDetail /></Suspense>} />
              <Route path="/student/satisfaction-survey" element={<Suspense fallback={<LoadingFallback />}><StudentSatisfactionSurvey /></Suspense>} />
              <Route path="/student/counseling-log" element={<Suspense fallback={<LoadingFallback />}><StudentCounselingLog /></Suspense>} />
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/courses" element={<Suspense fallback={<LoadingFallback />}><TeacherCourses /></Suspense>} />
              <Route path="/teacher/courses/:id" element={<Suspense fallback={<LoadingFallback />}><TeacherCourseDetail /></Suspense>} />
              <Route path="/teacher/students" element={<Suspense fallback={<LoadingFallback />}><TeacherStudents /></Suspense>} />
              <Route path="/teacher/revenue" element={<Suspense fallback={<LoadingFallback />}><TeacherRevenue /></Suspense>} />
              <Route path="/teacher/analytics" element={<Suspense fallback={<LoadingFallback />}><TeacherAnalytics /></Suspense>} />
              <Route path="/teacher/assignments" element={<Suspense fallback={<LoadingFallback />}><TeacherAssignments /></Suspense>} />
              <Route path="/teacher/attendance" element={<Suspense fallback={<LoadingFallback />}><TeacherAttendance /></Suspense>} />
              <Route path="/teacher/attendance-detail" element={<Suspense fallback={<LoadingFallback />}><TeacherAttendanceDetail /></Suspense>} />
              <Route path="/teacher/training-log" element={<Suspense fallback={<LoadingFallback />}><TeacherTrainingLog /></Suspense>} />
              <Route path="/teacher/satisfaction-survey" element={<Suspense fallback={<LoadingFallback />}><TeacherSatisfactionSurvey /></Suspense>} />
              <Route path="/teacher/counseling-log" element={<Suspense fallback={<LoadingFallback />}><TeacherCounselingLog /></Suspense>} />
              <Route path="/teacher/dropout-management" element={<Suspense fallback={<LoadingFallback />}><TeacherDropoutManagement /></Suspense>} />
              <Route path="/teacher/training-completion" element={<Suspense fallback={<LoadingFallback />}><TeacherTrainingCompletion /></Suspense>} />
              <Route path="/teacher/training-allowance" element={<Suspense fallback={<LoadingFallback />}><TeacherTrainingAllowance /></Suspense>} />
              <Route path="/teacher/training-report" element={<Suspense fallback={<LoadingFallback />}><TeacherTrainingReport /></Suspense>} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/operator" element={<OperatorDashboard />} />
              <Route path="/operator/tenants" element={<Suspense fallback={<LoadingFallback />}><OperatorTenants /></Suspense>} />
              <Route path="/operator/usage" element={<Suspense fallback={<LoadingFallback />}><OperatorUsage /></Suspense>} />
              <Route path="/operator/ai-logs" element={<Suspense fallback={<LoadingFallback />}><OperatorAILogs /></Suspense>} />
              <Route path="/operator/revenue" element={<Suspense fallback={<LoadingFallback />}><OperatorRevenue /></Suspense>} />
              <Route path="/operator/monitoring" element={<Suspense fallback={<LoadingFallback />}><OperatorMonitoring /></Suspense>} />
              <Route path="/operator/settings" element={<Suspense fallback={<LoadingFallback />}><OperatorSettings /></Suspense>} />
              <Route path="/operator/features" element={<Suspense fallback={<LoadingFallback />}><OperatorFeatures /></Suspense>} />
              <Route path="/operator/tech-stack" element={<Suspense fallback={<LoadingFallback />}><OperatorTechStack /></Suspense>} />
              <Route path="/operator/government-training" element={<Suspense fallback={<LoadingFallback />}><OperatorGovernmentTraining /></Suspense>} />
              <Route path="/operator/manual" element={<Suspense fallback={<LoadingFallback />}><OperatorManual /></Suspense>} />
              <Route path="/operator/system-diagram" element={<Suspense fallback={<LoadingFallback />}><OperatorSystemDiagram /></Suspense>} />
              <Route path="/operator/demo-approval" element={<Suspense fallback={<LoadingFallback />}><OperatorDemoApproval /></Suspense>} />
              <Route path="/operator/backup" element={<Suspense fallback={<LoadingFallback />}><OperatorBackup /></Suspense>} />
              <Route path="/operator/updates" element={<Suspense fallback={<LoadingFallback />}><OperatorUpdates /></Suspense>} />
              <Route path="/operator/license" element={<Suspense fallback={<LoadingFallback />}><OperatorLicense /></Suspense>} />
              <Route path="/operator/resources" element={<Suspense fallback={<LoadingFallback />}><OperatorResources /></Suspense>} />
              <Route path="/admin/users" element={<Suspense fallback={<LoadingFallback />}><AdminUsers /></Suspense>} />
              <Route path="/admin/courses" element={<Suspense fallback={<LoadingFallback />}><AdminCourses /></Suspense>} />
              <Route path="/admin/content" element={<Suspense fallback={<LoadingFallback />}><AdminContent /></Suspense>} />
              <Route path="/admin/attendance" element={<Suspense fallback={<LoadingFallback />}><AdminAttendance /></Suspense>} />
              <Route path="/admin/training-log" element={<Suspense fallback={<LoadingFallback />}><AdminTrainingLog /></Suspense>} />
              <Route path="/admin/satisfaction-survey" element={<Suspense fallback={<LoadingFallback />}><AdminSatisfactionSurvey /></Suspense>} />
              <Route path="/admin/counseling-log" element={<Suspense fallback={<LoadingFallback />}><AdminCounselingLog /></Suspense>} />
              <Route path="/admin/dropout-management" element={<Suspense fallback={<LoadingFallback />}><AdminDropoutManagement /></Suspense>} />
              <Route path="/admin/training-completion" element={<Suspense fallback={<LoadingFallback />}><AdminTrainingCompletion /></Suspense>} />
              <Route path="/admin/grades" element={<Suspense fallback={<LoadingFallback />}><AdminGrades /></Suspense>} />
              <Route path="/admin/training-allowance" element={<Suspense fallback={<LoadingFallback />}><AdminTrainingAllowance /></Suspense>} />
              <Route path="/admin/manual" element={<Suspense fallback={<LoadingFallback />}><AdminManual /></Suspense>} />
              <Route path="/admin/demo-approval" element={<Suspense fallback={<LoadingFallback />}><AdminDemoApproval /></Suspense>} />
              <Route path="/admin/revenue" element={<Suspense fallback={<LoadingFallback />}><AdminRevenue /></Suspense>} />
              <Route path="/admin/monitoring" element={<Suspense fallback={<LoadingFallback />}><AdminMonitoring /></Suspense>} />
              <Route path="/admin/learning" element={<Suspense fallback={<LoadingFallback />}><AdminLearning /></Suspense>} />
              <Route path="/admin/ai-logs" element={<Suspense fallback={<LoadingFallback />}><AdminAILogs /></Suspense>} />
              <Route path="/admin/analytics" element={<Suspense fallback={<LoadingFallback />}><AdminAnalytics /></Suspense>} />
              <Route path="/admin/settings" element={<Suspense fallback={<LoadingFallback />}><AdminSettings /></Suspense>} />
              <Route path="/payment/success" element={<Suspense fallback={<LoadingFallback />}><PaymentSuccess /></Suspense>} />
              <Route path="/payment/fail" element={<Suspense fallback={<LoadingFallback />}><PaymentFail /></Suspense>} />
              <Route path="/tenant/:subdomain" element={<Suspense fallback={<LoadingFallback />}><TenantHome /></Suspense>} />
              <Route path="/tenant/:subdomain/courses" element={<Suspense fallback={<LoadingFallback />}><TenantCourses /></Suspense>} />
              <Route path="/tenant/:subdomain/courses/:courseSlug" element={<Suspense fallback={<LoadingFallback />}><TenantCourseDetail /></Suspense>} />
              <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
