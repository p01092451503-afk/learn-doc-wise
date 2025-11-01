import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, AlertCircle, FileUp, CheckCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import atomLogo from "@/assets/atom-logo.png";

const TeacherAttendanceDetail = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingDetail, setEditingDetail] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 강의 목록 조회
  const { data: courses = [] } = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("instructor_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // 출석 기록과 상세 정보 조회
  const { data: attendances = [], isLoading } = useQuery({
    queryKey: ["attendance-details", selectedCourse, selectedDate],
    queryFn: async () => {
      if (!selectedCourse || !selectedDate) return [];
      
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          profiles:user_id (full_name),
          attendance_details (*)
        `)
        .eq("course_id", selectedCourse)
        .eq("attendance_date", selectedDate)
        .order("check_in_time", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCourse && !!selectedDate,
  });

  // 출석 상세 정보 저장/업데이트
  const saveAttendanceDetail = useMutation({
    mutationFn: async (formData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (formData.id) {
        // 업데이트
        const { error } = await supabase
          .from("attendance_details")
          .update({
            late_minutes: formData.late_minutes,
            early_leave_minutes: formData.early_leave_minutes,
            absence_reason: formData.absence_reason,
            excuse_document_url: formData.excuse_document_url,
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
          })
          .eq("id", formData.id);
        
        if (error) throw error;
      } else {
        // 새로 생성
        const { error } = await supabase
          .from("attendance_details")
          .insert({
            attendance_id: formData.attendance_id,
            late_minutes: formData.late_minutes,
            early_leave_minutes: formData.early_leave_minutes,
            absence_reason: formData.absence_reason,
            excuse_document_url: formData.excuse_document_url,
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-details"] });
      setEditingDetail(null);
      toast({
        title: "저장 완료",
        description: "출석 상세 정보가 저장되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "저장 실패",
        description: "출석 상세 정보 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSaveDetail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    saveAttendanceDetail.mutate({
      id: editingDetail?.attendance_details?.[0]?.id,
      attendance_id: editingDetail.id,
      late_minutes: parseInt(formData.get("late_minutes") as string) || 0,
      early_leave_minutes: parseInt(formData.get("early_leave_minutes") as string) || 0,
      absence_reason: formData.get("absence_reason") as string,
      excuse_document_url: formData.get("excuse_document_url") as string,
    });
  };

  // 출석률 계산
  const calculateAttendanceRate = () => {
    if (attendances.length === 0) return "0";
    const presentCount = attendances.filter((a: any) => a.status === "present" || a.status === "late").length;
    return ((presentCount / attendances.length) * 100).toFixed(1);
  };

  const statusLabels: { [key: string]: string } = {
    present: "출석",
    late: "지각",
    absent: "결석",
    excused: "결석(사유)",
  };

  const statusColors: { [key: string]: string } = {
    present: "bg-green-500",
    late: "bg-yellow-500",
    absent: "bg-red-500",
    excused: "bg-blue-500",
  };

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <img src={atomLogo} alt="atom" className="h-8 w-8" />
            출결 상세 관리
          </h1>
          <p className="text-muted-foreground mt-2">
            지각/조퇴 시간, 결석 사유를 상세히 관리하세요
          </p>
        </div>

        {/* 필터 */}
        <Card>
          <CardHeader>
            <CardTitle>필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>강의 선택</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="강의 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>날짜 선택</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 출석률 카드 */}
        {selectedCourse && selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>출석률</CardTitle>
              <CardDescription>
                {new Date(selectedDate).toLocaleDateString()} 기준
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-primary">
                  {calculateAttendanceRate()}%
                </div>
                <div className="text-sm text-muted-foreground">
                  총 {attendances.length}명 중 {attendances.filter((a: any) => a.status === "present" || a.status === "late").length}명 출석
                </div>
                {parseFloat(calculateAttendanceRate()) < 80 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    80% 미만
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 출석 기록 목록 */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                로딩 중...
              </CardContent>
            </Card>
          ) : !selectedCourse || !selectedDate ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                강의와 날짜를 선택하세요.
              </CardContent>
            </Card>
          ) : attendances.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                해당 날짜의 출석 기록이 없습니다.
              </CardContent>
            </Card>
          ) : (
            attendances.map((attendance: any) => {
              const detail = attendance.attendance_details?.[0];
              return (
                <Card key={attendance.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{attendance.profiles?.full_name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4" />
                          {attendance.check_in_time 
                            ? new Date(attendance.check_in_time).toLocaleTimeString()
                            : "체크인 없음"}
                        </CardDescription>
                      </div>
                      <Badge className={statusColors[attendance.status]}>
                        {statusLabels[attendance.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {detail && (
                      <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                        {detail.late_minutes > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="font-semibold">지각:</span>
                            <span>{detail.late_minutes}분</span>
                          </div>
                        )}
                        {detail.early_leave_minutes > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span className="font-semibold">조퇴:</span>
                            <span>{detail.early_leave_minutes}분</span>
                          </div>
                        )}
                        {detail.absence_reason && (
                          <div className="text-sm">
                            <span className="font-semibold">결석 사유:</span>
                            <p className="mt-1 text-muted-foreground">{detail.absence_reason}</p>
                          </div>
                        )}
                        {detail.excuse_document_url && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileUp className="h-4 w-4 text-blue-600" />
                            <a 
                              href={detail.excuse_document_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              증빙 서류 보기
                            </a>
                          </div>
                        )}
                        {detail.approved_at && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            승인됨 ({new Date(detail.approved_at).toLocaleString()})
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingDetail(attendance)}
                    >
                      상세 정보 {detail ? "수정" : "추가"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* 상세 정보 편집 Dialog */}
        <Dialog open={!!editingDetail} onOpenChange={() => setEditingDetail(null)}>
          <DialogContent className="max-w-xl">
            <form onSubmit={handleSaveDetail}>
              <DialogHeader>
                <DialogTitle>출석 상세 정보</DialogTitle>
                <DialogDescription>
                  {editingDetail?.profiles?.full_name}의 출석 상세 정보를 입력하세요
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="late_minutes">지각 (분)</Label>
                    <Input
                      id="late_minutes"
                      name="late_minutes"
                      type="number"
                      min="0"
                      defaultValue={String(editingDetail?.attendance_details?.[0]?.late_minutes || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="early_leave_minutes">조퇴 (분)</Label>
                    <Input
                      id="early_leave_minutes"
                      name="early_leave_minutes"
                      type="number"
                      min="0"
                      defaultValue={String(editingDetail?.attendance_details?.[0]?.early_leave_minutes || 0)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="absence_reason">결석 사유</Label>
                  <Textarea
                    id="absence_reason"
                    name="absence_reason"
                    placeholder="결석 사유를 입력하세요"
                    rows={3}
                    defaultValue={editingDetail?.attendance_details?.[0]?.absence_reason || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excuse_document_url">증빙 서류 URL</Label>
                  <Input
                    id="excuse_document_url"
                    name="excuse_document_url"
                    type="url"
                    placeholder="https://..."
                    defaultValue={editingDetail?.attendance_details?.[0]?.excuse_document_url || ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    * 증빙 서류를 업로드한 후 URL을 입력하세요
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saveAttendanceDetail.isPending}>
                  저장하기
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TeacherAttendanceDetail;
