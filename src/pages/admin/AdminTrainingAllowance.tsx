import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Download, DollarSign } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminTrainingAllowance = () => {
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
          government_training_info(training_allowance)
        `)
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["admin-training-allowance", selectedCourse],
    queryFn: async () => {
      let query = supabase
        .from("enrollments")
        .select(`
          *,
          courses(
            title,
            government_training_info(
              training_allowance,
              required_attendance_rate
            )
          )
        `)
        .order("enrolled_at", { ascending: false });

      if (selectedCourse && selectedCourse !== "all") {
        query = query.eq("course_id", selectedCourse);
      }

      const { data, error } = await query;
      if (error) throw error;

      // 각 수강생의 프로필과 출석률 계산
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

          return {
            ...enrollment,
            profiles: profileData,
            attendanceRate,
          };
        })
      );

      return enrichedData;
    },
  });

  const filteredData = enrollments.filter((item: any) =>
    item.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAllowance = (enrollment: any) => {
    const baseAllowance = enrollment.courses?.government_training_info?.training_allowance || 0;
    const requiredRate = enrollment.courses?.government_training_info?.required_attendance_rate || 80;
    const actualRate = enrollment.attendanceRate;

    if (actualRate >= requiredRate) {
      return baseAllowance;
    } else if (actualRate >= requiredRate * 0.9) {
      return baseAllowance * 0.5;
    } else {
      return 0;
    }
  };

  const totalAllowance = filteredData.reduce((sum, item) => sum + calculateAllowance(item), 0);

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-violet-500" />
              훈련수당 관리
            </h1>
            <p className="text-muted-foreground mt-1">
              수강생의 훈련수당 지급 현황을 확인합니다
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            지급 내역 다운로드
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">총 지급 예정액</p>
                <p className="text-2xl font-bold truncate">₩{totalAllowance.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">지급 대상자</p>
                <p className="text-2xl font-bold truncate">
                  {filteredData.filter(item => calculateAllowance(item) > 0).length}명
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 rounded-lg flex-shrink-0">
                <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">미지급 대상자</p>
                <p className="text-2xl font-bold truncate">
                  {filteredData.filter(item => calculateAllowance(item) === 0).length}명
                </p>
              </div>
            </div>
          </Card>
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
                  <TableHead>이메일</TableHead>
                  <TableHead>강의명</TableHead>
                  <TableHead>출석률</TableHead>
                  <TableHead>기본 수당</TableHead>
                  <TableHead>지급 수당</TableHead>
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
                      수강생 데이터가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item: any) => {
                    const allowance = calculateAllowance(item);
                    const baseAllowance = item.courses?.government_training_info?.training_allowance || 0;
                    const requiredRate = item.courses?.government_training_info?.required_attendance_rate || 80;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.profiles?.full_name || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.profiles?.email || "-"}
                        </TableCell>
                        <TableCell>{item.courses?.title || "-"}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            item.attendanceRate >= requiredRate ? "text-green-600 dark:text-green-400" :
                            item.attendanceRate >= requiredRate * 0.9 ? "text-yellow-600 dark:text-yellow-400" :
                            "text-red-600 dark:text-red-400"
                          }`}>
                            {item.attendanceRate.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₩{baseAllowance.toLocaleString()}
                        </TableCell>
                        <TableCell className={`font-bold ${
                          allowance === baseAllowance ? "text-green-600 dark:text-green-400" :
                          allowance > 0 ? "text-yellow-600 dark:text-yellow-400" :
                          "text-red-600 dark:text-red-400"
                        }`}>
                          ₩{allowance.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {allowance === baseAllowance ? "전액 지급" :
                           allowance > 0 ? "50% 감액" :
                           "지급 불가"}
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

export default AdminTrainingAllowance;
