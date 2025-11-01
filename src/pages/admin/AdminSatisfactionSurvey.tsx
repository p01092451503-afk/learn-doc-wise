import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Download, FileText, BarChart3 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import atomLogo from "@/assets/atom-logo.png";

const AdminSatisfactionSurvey = () => {
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

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ["admin-satisfaction-surveys", selectedCourse],
    queryFn: async () => {
      let query = supabase
        .from("satisfaction_surveys")
        .select(`
          *,
          courses(title),
          responses:survey_responses(count)
        `)
        .order("created_at", { ascending: false });

      if (selectedCourse && selectedCourse !== "all") {
        query = query.eq("course_id", selectedCourse);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredData = surveys.filter((item: any) =>
    item.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      draft: { label: "작성중", variant: "secondary" },
      active: { label: "진행중", variant: "default" },
      closed: { label: "마감", variant: "outline" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">만족도 조사 관리</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <img src={atomLogo} alt="atom" className="h-5 w-5" />
              전체 강의의 만족도 조사를 확인합니다
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            통계 다운로드
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="강의명, 조사 제목 검색..."
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
                  <TableHead>생성일</TableHead>
                  <TableHead>강의명</TableHead>
                  <TableHead>조사 제목</TableHead>
                  <TableHead>시작일</TableHead>
                  <TableHead>종료일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>응답수</TableHead>
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
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      만족도 조사 데이터가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {format(new Date(item.created_at), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell>{item.courses?.title || "-"}</TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>
                        {item.start_date ? format(new Date(item.start_date), "yyyy-MM-dd") : "-"}
                      </TableCell>
                      <TableCell>
                        {item.end_date ? format(new Date(item.end_date), "yyyy-MM-dd") : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-center">
                        {item.responses?.[0]?.count || 0}건
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <BarChart3 className="h-4 w-4" />
                          결과보기
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

export default AdminSatisfactionSurvey;
