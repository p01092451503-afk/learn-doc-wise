import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const AdminGrades = () => {
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

  const { data: grades = [], isLoading } = useQuery({
    queryKey: ["admin-grades", selectedCourse],
    queryFn: async () => {
      let query = supabase
        .from("grades")
        .select(`
          *,
          enrollment:enrollment_id(
            user_id,
            course:course_id(title),
            student:user_id(full_name, email)
          )
        `)
        .order("graded_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // 선택된 강의로 필터링
      if (selectedCourse && selectedCourse !== "all") {
        return data.filter((grade: any) => grade.enrollment?.course_id === selectedCourse);
      }

      return data;
    },
  });

  const filteredData = grades.filter((item: any) =>
    item.enrollment?.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.enrollment?.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.enrollment?.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGradeTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: any }> = {
      midterm: { label: "중간고사", variant: "default" },
      final: { label: "기말고사", variant: "default" },
      assignment: { label: "과제", variant: "secondary" },
      quiz: { label: "퀴즈", variant: "outline" },
      project: { label: "프로젝트", variant: "secondary" },
      participation: { label: "참여도", variant: "outline" },
    };
    const config = typeMap[type] || { label: type, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">성적 관리</h1>
            <p className="text-muted-foreground mt-1">전체 학생의 성적을 확인합니다</p>
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
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>채점일</TableHead>
                  <TableHead>학생명</TableHead>
                  <TableHead>강의명</TableHead>
                  <TableHead>평가유형</TableHead>
                  <TableHead>점수</TableHead>
                  <TableHead>백분율</TableHead>
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
                      성적 데이터가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {format(new Date(item.graded_at), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell>{item.enrollment?.student?.full_name || "-"}</TableCell>
                      <TableCell>{item.enrollment?.course?.title || "-"}</TableCell>
                      <TableCell>{getGradeTypeBadge(item.grade_type)}</TableCell>
                      <TableCell className="font-medium">
                        {item.score} / {item.max_score}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${
                            item.percentage >= 90 ? "text-green-600 dark:text-green-400" :
                            item.percentage >= 80 ? "text-blue-600 dark:text-blue-400" :
                            item.percentage >= 70 ? "text-yellow-600 dark:text-yellow-400" :
                            item.percentage >= 60 ? "text-orange-600 dark:text-orange-400" :
                            "text-red-600 dark:text-red-400"
                          }`}>
                            {item.percentage?.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
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

export default AdminGrades;
