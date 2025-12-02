import { StudentMonitoringDashboard } from "@/components/monitoring/StudentMonitoringDashboard";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function AdminStudentMonitoring() {
  return (
    <DashboardLayout userRole="admin">
      <StudentMonitoringDashboard />
    </DashboardLayout>
  );
}
