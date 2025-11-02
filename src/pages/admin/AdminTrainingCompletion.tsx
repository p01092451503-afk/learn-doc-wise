import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Download, Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const AdminTrainingCompletion = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          id, 
          title,
          government_training_info(
            required_attendance_rate,
            required_exam_score
          )
        `)
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["admin-training-completion", selectedCourse],
    queryFn: async () => {
      let query = supabase
        .from("enrollments")
        .select(`
          *,
          courses(
            title,
            government_training_info(
              required_attendance_rate,
              required_exam_score
            )
          )
        `)
        .order("enrolled_at", { ascending: false });

      if (selectedCourse && selectedCourse !== "all") {
        query = query.eq("course_id", selectedCourse);
      }

      const { data, error } = await query;
      if (error) throw error;

      // 각 수강생의 프로필, 출석률과 성적 계산
      const enrichedData = await Promise.all(
        data.map(async (enrollment: any) => {
          // 프로필 정보 가져오기
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", enrollment.user_id)
            .single();

          // 출석률 계산
          const { data: attendanceData } = await supabase
            .from("attendance")
            .select("status")
            .eq("user_id", enrollment.user_id)
            .eq("course_id", enrollment.course_id);

          const totalDays = attendanceData?.length || 0;
          const presentDays = attendanceData?.filter((a) => a.status === "present" || a.status === "excused").length || 0;
          const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

          // 평균 성적 계산
          const { data: gradesData } = await supabase
            .from("grades")
            .select("percentage")
            .eq("enrollment_id", enrollment.id);

          const avgGrade = gradesData && gradesData.length > 0
            ? gradesData.reduce((sum, g) => sum + (g.percentage || 0), 0) / gradesData.length
            : 0;

          return {
            ...enrollment,
            student: profileData,
            attendanceRate,
            avgGrade,
          };
        })
      );

      return enrichedData;
    },
  });

  const filteredData = enrollments.filter((item: any) =>
    item.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkCompletion = (enrollment: any) => {
    const requiredAttendance = enrollment.courses?.government_training_info?.required_attendance_rate || 80;
    const requiredGrade = enrollment.courses?.government_training_info?.required_exam_score || 60;

    const attendanceMet = enrollment.attendanceRate >= requiredAttendance;
    const gradeMet = enrollment.avgGrade >= requiredGrade;

    return attendanceMet && gradeMet;
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="h-8 w-8 text-violet-500" />
              수료 관리
            </h1>
            <p className="text-muted-foreground mt-1">
              수강생의 수료 요건 충족 현황을 확인합니다
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            수료 현황 다운로드
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
                  <TableHead>학생명</TableHead>
                  <TableHead>강의명</TableHead>
                  <TableHead>출석률</TableHead>
                  <TableHead>평균성적</TableHead>
                  <TableHead>수료요건</TableHead>
                  <TableHead>수료여부</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      로딩 중...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      수강생 데이터가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item: any) => {
                    const isCompleted = checkCompletion(item);
                    const requiredAttendance = item.courses?.government_training_info?.required_attendance_rate || 80;
                    const requiredGrade = item.courses?.government_training_info?.required_exam_score || 60;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.student?.full_name || "-"}
                        </TableCell>
                        <TableCell>{item.courses?.title || "-"}</TableCell>
                        <TableCell>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.attendanceRate.toFixed(1)}%</span>
                              {item.attendanceRate >= requiredAttendance ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <Progress value={item.attendanceRate} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.avgGrade.toFixed(1)}점</span>
                              {item.avgGrade >= requiredGrade ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <Progress value={item.avgGrade} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          출석 {requiredAttendance}% 이상<br />
                          성적 {requiredGrade}점 이상
                        </TableCell>
                        <TableCell>
                          {isCompleted ? (
                            <Badge variant="default" className="gap-1">
                              <Trophy className="h-3 w-3" />
                              수료
                            </Badge>
                          ) : (
                            <Badge variant="secondary">미수료</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminTrainingCompletion;
