import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { UserProvider } from "./contexts/UserContext";
import { TenantProvider } from "./contexts/TenantContext";
import { AtomLoader } from "./components/AtomLoader";
import { ImpersonationBanner } from "./components/operator/ImpersonationBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import { initWebVitals } from "./lib/analytics";

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
const AdminTenantSettings = lazy(() => import("./pages/admin/AdminTenantSettings"));
const OperatorHomepageSettings = lazy(() => import("./pages/operator/OperatorHomepageSettings"));
const TeacherTrainingLog = lazy(() => import("./pages/teacher/TeacherTrainingLog"));
const TeacherSatisfactionSurvey = lazy(() => import("./pages/teacher/TeacherSatisfactionSurvey"));
const TeacherCounselingLog = lazy(() => import("./pages/teacher/TeacherCounselingLog"));
const TeacherDropoutManagement = lazy(() => import("./pages/teacher/TeacherDropoutManagement"));
const TeacherAttendanceDetail = lazy(() => import("./pages/teacher/TeacherAttendanceDetail"));
const TeacherTrainingCompletion = lazy(() => import("./pages/teacher/TeacherTrainingCompletion"));
const TeacherTrainingAllowance = lazy(() => import("./pages/teacher/TeacherTrainingAllowance"));
const TeacherTrainingReport = lazy(() => import("./pages/teacher/TeacherTrainingReport"));
const TeacherStudentDetail = lazy(() => import("./pages/teacher/TeacherStudentDetail"));
const StudentSatisfactionSurvey = lazy(() => import("./pages/student/StudentSatisfactionSurvey"));
const StudentCounselingLog = lazy(() => import("./pages/student/StudentCounselingLog"));
const StudentCart = lazy(() => import("./pages/student/StudentCart"));
const StudentPaymentHistory = lazy(() => import("./pages/student/StudentPaymentHistory"));
const StudentPoints = lazy(() => import("./pages/student/StudentPoints"));
const StudentSettings = lazy(() => import("./pages/student/StudentSettings"));
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
const OperatorOnboardingFlow = lazy(() => import("./pages/operator/OperatorOnboardingFlow"));
const OperatorSystemDiagram = lazy(() => import("./pages/operator/OperatorSystemDiagram"));
const OperatorBackup = lazy(() => import("./pages/operator/OperatorBackup"));
const OperatorUpdates = lazy(() => import("./pages/operator/OperatorUpdates"));
const OperatorLicense = lazy(() => import("./pages/operator/OperatorLicense"));
const OperatorResources = lazy(() => import("./pages/operator/OperatorResources"));
const OperatorImpersonationLogs = lazy(() => import("./pages/operator/OperatorImpersonationLogs"));
const OperatorContracts = lazy(() => import("./pages/operator/OperatorContracts"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const FeaturesShowcase = lazy(() => import("./pages/FeaturesShowcase"));
const AdminDemo = lazy(() => import("./pages/AdminDemo"));
const AIShowcase = lazy(() => import("./pages/AIShowcase"));
const TenantHome = lazy(() => import("./pages/TenantHome"));
const TenantCourses = lazy(() => import("./pages/TenantCourses"));
const TenantCourseDetail = lazy(() => import("./pages/TenantCourseDetail"));
const StudentLiveSession = lazy(() => import("./pages/StudentLiveSession"));
const TeacherLiveSession = lazy(() => import("./pages/TeacherLiveSession"));
const AdminLiveSession = lazy(() => import("./pages/AdminLiveSession"));

// Loading component with atom logo animation
const LoadingFallback = () => <AtomLoader />;

// 페이지 전환 시 스크롤을 최상단으로 이동하고 이전 컨텐츠 제거
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Routes wrapper with location-based key for complete remount
const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <Suspense fallback={<LoadingFallback />} key={location.pathname}>
      <Routes location={location}>
        {/* Public routes */}
        <Route path="/" element={<Auth />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/features-detail" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/features" element={<FeaturesShowcase />} />
        <Route path="/main" element={<PublicMain />} />
        <Route path="/courses" element={<PublicCourses />} />
        <Route path="/courses/:id" element={<PublicCourseDetail />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/demo" element={<DemoPreview />} />
        <Route path="/admin-demo" element={<AdminDemo />} />
        <Route path="/ai-showcase" element={<AIShowcase />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />
        <Route path="/tenant/:subdomain" element={<TenantHome />} />
        <Route path="/tenant/:subdomain/courses" element={<TenantCourses />} />
        <Route path="/tenant/:subdomain/courses/:courseSlug" element={<TenantCourseDetail />} />

        {/* Student routes */}
        <Route path="/student" element={<ErrorBoundary><StudentDashboard /></ErrorBoundary>} />
        <Route path="/students" element={<ErrorBoundary><StudentDashboard /></ErrorBoundary>} />
        <Route path="/student/courses" element={<ErrorBoundary><StudentCourses /></ErrorBoundary>} />
        <Route path="/student/courses/:id" element={<ErrorBoundary><StudentCourseDetail /></ErrorBoundary>} />
        <Route path="/student/assignments" element={<ErrorBoundary><StudentAssignments /></ErrorBoundary>} />
        <Route path="/student/community" element={<ErrorBoundary><StudentCommunity /></ErrorBoundary>} />
        <Route path="/student/analytics" element={<ErrorBoundary><StudentAnalytics /></ErrorBoundary>} />
        <Route path="/student/gamification" element={<ErrorBoundary><StudentGamification /></ErrorBoundary>} />
        <Route path="/student/learning-path" element={<ErrorBoundary><StudentLearningPath /></ErrorBoundary>} />
        <Route path="/student/learning-path/:id" element={<ErrorBoundary><StudentLearningPathDetail /></ErrorBoundary>} />
        <Route path="/student/satisfaction-survey" element={<ErrorBoundary><StudentSatisfactionSurvey /></ErrorBoundary>} />
        <Route path="/student/counseling-log" element={<ErrorBoundary><StudentCounselingLog /></ErrorBoundary>} />
        <Route path="/student/cart" element={<ErrorBoundary><StudentCart /></ErrorBoundary>} />
        <Route path="/student/payment-history" element={<ErrorBoundary><StudentPaymentHistory /></ErrorBoundary>} />
        <Route path="/student/points" element={<ErrorBoundary><StudentPoints /></ErrorBoundary>} />
        <Route path="/student/settings" element={<ErrorBoundary><StudentSettings /></ErrorBoundary>} />
        <Route path="/student/live/:sessionId" element={<ErrorBoundary><StudentLiveSession /></ErrorBoundary>} />

        {/* Teacher routes */}
        <Route path="/teacher" element={<ErrorBoundary><TeacherDashboard /></ErrorBoundary>} />
        <Route path="/teacher/courses" element={<ErrorBoundary><TeacherCourses /></ErrorBoundary>} />
        <Route path="/teacher/courses/:id" element={<ErrorBoundary><TeacherCourseDetail /></ErrorBoundary>} />
        <Route path="/teacher/students" element={<ErrorBoundary><TeacherStudents /></ErrorBoundary>} />
        <Route path="/teacher/students/:studentId" element={<ErrorBoundary><TeacherStudentDetail /></ErrorBoundary>} />
        <Route path="/teacher/revenue" element={<ErrorBoundary><TeacherRevenue /></ErrorBoundary>} />
        <Route path="/teacher/analytics" element={<ErrorBoundary><TeacherAnalytics /></ErrorBoundary>} />
        <Route path="/teacher/assignments" element={<ErrorBoundary><TeacherAssignments /></ErrorBoundary>} />
        <Route path="/teacher/attendance" element={<ErrorBoundary><TeacherAttendance /></ErrorBoundary>} />
        <Route path="/teacher/attendance-detail" element={<ErrorBoundary><TeacherAttendanceDetail /></ErrorBoundary>} />
        <Route path="/teacher/training-log" element={<ErrorBoundary><TeacherTrainingLog /></ErrorBoundary>} />
        <Route path="/teacher/satisfaction-survey" element={<ErrorBoundary><TeacherSatisfactionSurvey /></ErrorBoundary>} />
        <Route path="/teacher/counseling-log" element={<ErrorBoundary><TeacherCounselingLog /></ErrorBoundary>} />
        <Route path="/teacher/dropout-management" element={<ErrorBoundary><TeacherDropoutManagement /></ErrorBoundary>} />
        <Route path="/teacher/training-completion" element={<ErrorBoundary><TeacherTrainingCompletion /></ErrorBoundary>} />
        <Route path="/teacher/training-allowance" element={<ErrorBoundary><TeacherTrainingAllowance /></ErrorBoundary>} />
        <Route path="/teacher/training-report" element={<ErrorBoundary><TeacherTrainingReport /></ErrorBoundary>} />
        <Route path="/teacher/live/:sessionId" element={<ErrorBoundary><TeacherLiveSession /></ErrorBoundary>} />

        {/* Admin routes */}
        <Route path="/admin" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
        <Route path="/admin/users" element={<ErrorBoundary><AdminUsers /></ErrorBoundary>} />
        <Route path="/admin/courses" element={<ErrorBoundary><AdminCoursesIntegrated /></ErrorBoundary>} />
        <Route path="/admin/content" element={<ErrorBoundary><AdminContent /></ErrorBoundary>} />
        <Route path="/admin/attendance" element={<ErrorBoundary><AdminAttendance /></ErrorBoundary>} />
        <Route path="/admin/training-log" element={<ErrorBoundary><AdminTrainingLog /></ErrorBoundary>} />
        <Route path="/admin/satisfaction-survey" element={<ErrorBoundary><AdminSatisfactionSurvey /></ErrorBoundary>} />
        <Route path="/admin/counseling-log" element={<ErrorBoundary><AdminCounselingLog /></ErrorBoundary>} />
        <Route path="/admin/dropout-management" element={<ErrorBoundary><AdminDropoutManagement /></ErrorBoundary>} />
        <Route path="/admin/training-completion" element={<ErrorBoundary><AdminTrainingCompletion /></ErrorBoundary>} />
        <Route path="/admin/grades" element={<ErrorBoundary><AdminGrades /></ErrorBoundary>} />
        <Route path="/admin/training-allowance" element={<ErrorBoundary><AdminTrainingAllowance /></ErrorBoundary>} />
        <Route path="/admin/manual" element={<ErrorBoundary><AdminManual /></ErrorBoundary>} />
        <Route path="/admin/revenue" element={<ErrorBoundary><AdminRevenue /></ErrorBoundary>} />
        <Route path="/admin/monitoring" element={<ErrorBoundary><AdminMonitoring /></ErrorBoundary>} />
        <Route path="/admin/learning" element={<ErrorBoundary><AdminLearning /></ErrorBoundary>} />
        <Route path="/admin/ai-logs" element={<ErrorBoundary><AdminAILogs /></ErrorBoundary>} />
        <Route path="/admin/analytics" element={<ErrorBoundary><AdminAnalytics /></ErrorBoundary>} />
        <Route path="/admin/settings" element={<ErrorBoundary><AdminSettings /></ErrorBoundary>} />
        <Route path="/admin/tenant-settings" element={<ErrorBoundary><AdminTenantSettings /></ErrorBoundary>} />
        <Route path="/admin/live/:sessionId" element={<ErrorBoundary><AdminLiveSession /></ErrorBoundary>} />

        {/* Operator routes */}
        <Route path="/operator" element={<ErrorBoundary><OperatorDashboard /></ErrorBoundary>} />
        <Route path="/operator/tenants" element={<ErrorBoundary><OperatorTenants /></ErrorBoundary>} />
        <Route path="/operator/contracts" element={<ErrorBoundary><OperatorContracts /></ErrorBoundary>} />
        <Route path="/operator/impersonation-logs" element={<ErrorBoundary><OperatorImpersonationLogs /></ErrorBoundary>} />
        <Route path="/operator/usage" element={<ErrorBoundary><OperatorUsage /></ErrorBoundary>} />
        <Route path="/operator/ai-logs" element={<ErrorBoundary><OperatorAILogs /></ErrorBoundary>} />
        <Route path="/operator/revenue" element={<ErrorBoundary><OperatorRevenue /></ErrorBoundary>} />
        <Route path="/operator/monitoring" element={<ErrorBoundary><OperatorMonitoring /></ErrorBoundary>} />
        <Route path="/operator/settings" element={<ErrorBoundary><OperatorSettings /></ErrorBoundary>} />
        <Route path="/operator/features" element={<ErrorBoundary><OperatorFeatures /></ErrorBoundary>} />
        <Route path="/operator/tech-stack" element={<ErrorBoundary><OperatorTechStack /></ErrorBoundary>} />
        <Route path="/operator/government-training" element={<ErrorBoundary><OperatorGovernmentTraining /></ErrorBoundary>} />
        <Route path="/operator/manual" element={<ErrorBoundary><OperatorManual /></ErrorBoundary>} />
        <Route path="/operator/onboarding-flow" element={<ErrorBoundary><OperatorOnboardingFlow /></ErrorBoundary>} />
        <Route path="/operator/system-diagram" element={<ErrorBoundary><OperatorSystemDiagram /></ErrorBoundary>} />
        <Route path="/operator/backup" element={<ErrorBoundary><OperatorBackup /></ErrorBoundary>} />
        <Route path="/operator/updates" element={<ErrorBoundary><OperatorUpdates /></ErrorBoundary>} />
        <Route path="/operator/license" element={<ErrorBoundary><OperatorLicense /></ErrorBoundary>} />
        <Route path="/operator/resources" element={<ErrorBoundary><OperatorResources /></ErrorBoundary>} />
        <Route path="/operator/homepage-settings" element={<ErrorBoundary><OperatorHomepageSettings /></ErrorBoundary>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 60 * 1000,        // 30분 - 공격적 캐싱
        gcTime: 60 * 60 * 1000,           // 1시간 - 더 긴 메모리 유지
        retry: (failureCount, error) => {
          const status = (error as any)?.status;
          if (status === 401 || status === 403) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        networkMode: 'offlineFirst',      // 캐시 우선 사용
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <UserProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ImpersonationBanner />
                <ScrollToTop />
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </UserProvider>
      </TenantProvider>
    </QueryClientProvider>
  );
};

export default App;
