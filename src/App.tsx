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
import AdminDashboard from "./pages/AdminDashboard";
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
          <Route path="/auth" element={<Auth />} />
          <Route path="/demo" element={<DemoPreview />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<StudentCourses />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/community" element={<StudentCommunity />} />
          <Route path="/student/analytics" element={<StudentAnalytics />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
