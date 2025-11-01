import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import atomLogo from "@/assets/atom-logo.png";

const AdminAttendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: attendanceData = [], isLoading } = useQuery({
    queryKey: ["admin-attendance", selectedCourse, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from("attendance")
        .select(`
          *,
          courses(title),
          profiles:user_id(full_name, email)
        `)
        .order("attendance_date", { ascending: false });

      if (selectedCourse && selectedCourse !== "all") {
        query = query.eq("course_id", selectedCourse);
      }

      if (selectedStatus && selectedStatus !== "all") {
        query = query.eq("status", selectedStatus as "present" | "late" | "absent" | "excused");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      present: { label: "출석", variant: "default" },
      late: { label: "지각", variant: "secondary" },
      absent: { label: "결석", variant: "destructive" },
      excused: { label: "공결", variant: "outline" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredData = attendanceData.filter((item: any) =>
    item.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">출석 관리</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <img src={atomLogo} alt="atom" className="h-5 w-5" />
              전체 강의의 출석 현황을 관리합니다
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            엑셀 다운로드
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="학생명, 이메일, 강의명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="강의 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 강의</SelectItem>
                {courses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="출석 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="present">출석</SelectItem>
                <SelectItem value="late">지각</SelectItem>
                <SelectItem value="absent">결석</SelectItem>
                <SelectItem value="excused">공결</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>학생명</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>강의명</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>출석 시간</TableHead>
                  <TableHead>비고</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      로딩 중...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      출석 데이터가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {format(new Date(item.attendance_date), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell>{item.profiles?.full_name || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{item.profiles?.email || "-"}</TableCell>
                      <TableCell>{item.courses?.title || "-"}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {item.check_in_time ? format(new Date(item.check_in_time), "HH:mm") : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAttendance;
