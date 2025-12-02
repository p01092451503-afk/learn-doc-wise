import { StudentMonitoringDashboard } from "@/components/monitoring/StudentMonitoringDashboard";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function TeacherStudentMonitoring() {
  return (
    <DashboardLayout userRole="teacher">
      <StudentMonitoringDashboard />
    </DashboardLayout>
  );
}
