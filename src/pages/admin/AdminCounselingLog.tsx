import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Download, Eye, ClipboardList } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const AdminCounselingLog = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

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

  const { data: counselingLogs = [], isLoading } = useQuery({
    queryKey: ["admin-counseling-logs", selectedCourse],
    queryFn: async () => {
      let query = supabase
        .from("counseling_logs")
        .select(`
          *,
          courses(title),
          student:student_id(full_name, email),
          counselor:counselor_id(full_name)
        `)
        .order("counseling_date", { ascending: false });

      if (selectedCourse && selectedCourse !== "all") {
        query = query.eq("course_id", selectedCourse);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });


  const getCounselingTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: any }> = {
      academic: { label: "학업", variant: "default" },
      career: { label: "진로", variant: "secondary" },
      personal: { label: "개인", variant: "outline" },
      dropout_risk: { label: "중도탈락위험", variant: "destructive" },
    };
    const config = typeMap[type] || { label: type, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ClipboardList className="h-8 w-8 text-violet-500" />
              상담일지 관리
            </h1>
            <p className="text-muted-foreground mt-1">
              전체 상담 기록을 확인합니다
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            엑셀 다운로드
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>상담일</TableHead>
                  <TableHead>학생명</TableHead>
                  <TableHead>강의명</TableHead>
                  <TableHead>상담사</TableHead>
                  <TableHead>상담유형</TableHead>
                  <TableHead>요약</TableHead>
                  <TableHead>후속조치</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      로딩 중...
                    </TableCell>
                  </TableRow>
                ) : counselingLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      상담 기록이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  counselingLogs.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {format(new Date(item.counseling_date), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell>{item.student?.full_name || "-"}</TableCell>
                      <TableCell>{item.courses?.title || "-"}</TableCell>
                      <TableCell>{item.counselor?.full_name || "-"}</TableCell>
                      <TableCell>{getCounselingTypeBadge(item.counseling_type)}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {item.summary}
                      </TableCell>
                      <TableCell>
                        {item.follow_up_needed ? (
                          <Badge variant="secondary">
                            {item.follow_up_date ? format(new Date(item.follow_up_date), "MM/dd") : "필요"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          상세
                        </Button>
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

export default AdminCounselingLog;
