import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Download, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import atomLogo from "@/assets/atom-logo.png";

const AdminTrainingLog = () => {
  const [searchTerm, setSearchTerm] = useState("");
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

  const { data: trainingLogs = [], isLoading } = useQuery({
    queryKey: ["admin-training-logs", selectedCourse],
    queryFn: async () => {
      let query = supabase
        .from("training_logs")
        .select(`
          *,
          courses(title),
          profiles:instructor_id(full_name)
        `)
        .order("training_date", { ascending: false });

      if (selectedCourse && selectedCourse !== "all") {
        query = query.eq("course_id", selectedCourse);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredData = trainingLogs.filter((item: any) =>
    item.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <img src={atomLogo} alt="atom" className="h-8 w-8" />
              훈련일지 관리
            </h1>
            <p className="text-muted-foreground mt-1">
              전체 강의의 훈련일지를 확인합니다
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
                placeholder="강의명, 강사명, 주제 검색..."
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
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>훈련일자</TableHead>
                  <TableHead>강의명</TableHead>
                  <TableHead>강사명</TableHead>
                  <TableHead>주제</TableHead>
                  <TableHead>교시</TableHead>
                  <TableHead>출석인원</TableHead>
                  <TableHead>교육내용</TableHead>
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
                      훈련일지 데이터가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {format(new Date(item.training_date), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell>{item.courses?.title || "-"}</TableCell>
                      <TableCell>{item.profiles?.full_name || "-"}</TableCell>
                      <TableCell>{item.topic || "-"}</TableCell>
                      <TableCell className="text-center">{item.training_hours}교시</TableCell>
                      <TableCell className="text-center">
                        {item.attendance_count || 0}명
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {item.training_content || "-"}
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

export default AdminTrainingLog;
