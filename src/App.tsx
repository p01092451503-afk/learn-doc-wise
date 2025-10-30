import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import DemoPreview from "./pages/DemoPreview";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCourses from "./pages/StudentCourses";
import StudentAssignments from "./pages/StudentAssignments";
import StudentCommunity from "./pages/StudentCommunity";
import StudentAnalytics from "./pages/StudentAnalytics";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherCourses from "./pages/TeacherCourses";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherRevenue from "./pages/TeacherRevenue";
import TeacherAnalytics from "./pages/TeacherAnalytics";
import TeacherAssignments from "./pages/TeacherAssignments";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminCourses from "./pages/AdminCourses";
import AdminContent from "./pages/AdminContent";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminRevenue from "./pages/AdminRevenue";
import AdminSettings from "./pages/AdminSettings";
import AdminTenants from "./pages/AdminTenants";
import AdminAILogs from "./pages/AdminAILogs";
import AdminMonitoring from "./pages/AdminMonitoring";
import AdminLearning from "./pages/AdminLearning";
import PublicMain from "./pages/PublicMain";
import PublicCourses from "./pages/PublicCourses";
import PublicCourseDetail from "./pages/PublicCourseDetail";
import StudentCourseDetail from "./pages/StudentCourseDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/main" element={<PublicMain />} />
          <Route path="/courses" element={<PublicCourses />} />
          <Route path="/courses/:id" element={<PublicCourseDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/demo" element={<DemoPreview />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<StudentCourses />} />
          <Route path="/student/courses/:id" element={<StudentCourseDetail />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/community" element={<StudentCommunity />} />
          <Route path="/student/analytics" element={<StudentAnalytics />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/courses" element={<TeacherCourses />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/revenue" element={<TeacherRevenue />} />
          <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/content" element={<AdminContent />} />
          <Route path="/admin/tenants" element={<AdminTenants />} />
          <Route path="/admin/revenue" element={<AdminRevenue />} />
          <Route path="/admin/ai-logs" element={<AdminAILogs />} />
          <Route path="/admin/monitoring" element={<AdminMonitoring />} />
          <Route path="/admin/learning" element={<AdminLearning />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
