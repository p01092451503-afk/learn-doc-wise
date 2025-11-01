import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, AlertTriangle, DollarSign, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import atomLogo from "@/assets/atom-logo.png";

const TeacherDropoutManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedEnrollment, setSelectedEnrollment] = useState<string>("");
  const [refundAmount, setRefundAmount] = useState<number>(0);
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

  // 수강생 목록 조회 (선택된 강의 기준)
  const { data: enrollments = [] } = useQuery({
    queryKey: ["course-enrollments", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          user_id,
          enrolled_at,
          courses (price),
          profiles:user_id (full_name)
        `)
        .eq("course_id", selectedCourse);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCourse,
  });

  // 중도탈락 기록 조회
  const { data: dropouts = [], isLoading } = useQuery({
    queryKey: ["dropout-records", selectedCourse],
    queryFn: async () => {
      let query = supabase
        .from("dropout_records")
        .select(`
          *,
          enrollments (
            user_id,
            courses (title),
            profiles:user_id (full_name)
          )
        `)
        .order("dropout_date", { ascending: false });

      if (selectedCourse) {
        query = query.eq("enrollments.course_id", selectedCourse);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // 환불 금액 자동 계산
  const calculateRefund = (enrollmentId: string) => {
    const enrollment = enrollments.find((e: any) => e.id === enrollmentId);
    if (!enrollment) return;

    const coursePrice = enrollment.courses?.price || 0;
    const enrolledDate = new Date(enrollment.enrolled_at);
    const today = new Date();
    const daysElapsed = Math.floor((today.getTime() - enrolledDate.getTime()) / (1000 * 60 * 60 * 24));

    // 간단한 환불 정책 예시 (7일 이내 100%, 30일 이내 50%, 이후 환불 불가)
    let refundRate = 0;
    if (daysElapsed <= 7) {
      refundRate = 1.0;
    } else if (daysElapsed <= 30) {
      refundRate = 0.5;
    }

    setRefundAmount(coursePrice * refundRate);
  };

  // 중도탈락 기록 생성
  const createDropout = useMutation({
    mutationFn: async (formData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("dropout_records")
        .insert({
          ...formData,
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dropout-records"] });
      setIsCreateDialogOpen(false);
      setRefundAmount(0);
      toast({
        title: "중도탈락 처리 완료",
        description: "중도탈락이 성공적으로 처리되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "처리 실패",
        description: "중도탈락 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // 환불 상태 업데이트
  const updateRefundStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("dropout_records")
        .update({ refund_status: status })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dropout-records"] });
      toast({
        title: "상태 업데이트",
        description: "환불 상태가 업데이트되었습니다.",
      });
    },
  });

  const handleCreateDropout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createDropout.mutate({
      enrollment_id: formData.get("enrollment_id"),
      reason_category: formData.get("reason_category"),
      dropout_reason: formData.get("dropout_reason"),
      dropout_date: formData.get("dropout_date"),
      interview_notes: formData.get("interview_notes"),
      refund_amount: parseFloat(formData.get("refund_amount") as string),
      refund_status: "pending",
      documents: [],
    });
  };

  const reasonCategories = [
    { value: "personal", label: "개인 사유" },
    { value: "health", label: "건강 문제" },
    { value: "employment", label: "취업" },
    { value: "financial", label: "경제적 사유" },
    { value: "dissatisfaction", label: "교육 불만족" },
    { value: "relocation", label: "이사/이동" },
    { value: "other", label: "기타" },
  ];

  const refundStatusLabels: { [key: string]: string } = {
    pending: "대기중",
    approved: "승인됨",
    completed: "완료",
    rejected: "거절됨",
  };

  const refundStatusColors: { [key: string]: string } = {
    pending: "bg-yellow-500",
    approved: "bg-blue-500",
    completed: "bg-green-500",
    rejected: "bg-red-500",
  };

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">중도탈락 관리</h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <img src={atomLogo} alt="atom" className="h-5 w-5" />
              중도탈락자를 관리하고 환불을 처리하세요
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                중도탈락 처리
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleCreateDropout}>
                <DialogHeader>
                  <DialogTitle>중도탈락 처리</DialogTitle>
                  <DialogDescription>
                    중도탈락 정보를 입력하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="course_id">강의 선택</Label>
                    <Select 
                      name="course_id" 
                      required
                      onValueChange={setSelectedCourse}
                    >
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
                    <Label htmlFor="enrollment_id">학생 선택</Label>
                    <Select 
                      name="enrollment_id" 
                      required 
                      disabled={!selectedCourse}
                      onValueChange={(value) => {
                        setSelectedEnrollment(value);
                        calculateRefund(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="학생 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {enrollments.map((enrollment: any) => (
                          <SelectItem key={enrollment.id} value={enrollment.id}>
                            {enrollment.profiles?.full_name || "이름 없음"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason_category">탈락 사유 분류</Label>
                      <Select name="reason_category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="분류 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {reasonCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dropout_date">탈락일</Label>
                      <Input
                        id="dropout_date"
                        name="dropout_date"
                        type="date"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dropout_reason">탈락 사유 상세</Label>
                    <Textarea
                      id="dropout_reason"
                      name="dropout_reason"
                      placeholder="탈락 사유를 상세히 기록하세요"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interview_notes">상담 내용</Label>
                    <Textarea
                      id="interview_notes"
                      name="interview_notes"
                      placeholder="학생과의 상담 내용을 기록하세요"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refund_amount">환불 금액 (원)</Label>
                    <Input
                      id="refund_amount"
                      name="refund_amount"
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      * 자동 계산된 금액입니다. 필요시 수정 가능합니다.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createDropout.isPending}>
                    처리하기
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 필터 */}
        <Card>
          <CardHeader>
            <CardTitle>필터</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCourse || "all"} onValueChange={(value) => setSelectedCourse(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="전체 강의" />
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
          </CardContent>
        </Card>

        {/* 통계 카드 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                총 탈락자
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dropouts.length}명</div>
            </CardContent>
          </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        환불 대기
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {dropouts.filter((d: any) => d.refund_status === "pending").length}건
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        환불 완료
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {dropouts.filter((d: any) => d.refund_status === "completed").length}건
                      </div>
                    </CardContent>
                  </Card>
        </div>

        {/* 중도탈락 기록 목록 */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                로딩 중...
              </CardContent>
            </Card>
          ) : dropouts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                중도탈락 기록이 없습니다.
              </CardContent>
            </Card>
          ) : (
            dropouts.map((dropout: any) => (
              <Card key={dropout.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{dropout.enrollments?.profiles?.full_name}</CardTitle>
                      <CardDescription>
                        {dropout.enrollments?.courses?.title}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge>
                        {reasonCategories.find(c => c.value === dropout.reason_category)?.label}
                      </Badge>
                      <Badge className={refundStatusColors[dropout.refund_status]}>
                        {refundStatusLabels[dropout.refund_status]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-semibold">탈락일:</span> {new Date(dropout.dropout_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">사유:</span> {dropout.dropout_reason}
                    </div>
                    {dropout.interview_notes && (
                      <div className="text-sm">
                        <span className="font-semibold">상담 내용:</span> {dropout.interview_notes}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">환불 금액:</span>
                      <span className="text-lg font-bold text-primary">
                        {dropout.refund_amount?.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  {dropout.refund_status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateRefundStatus.mutate({ id: dropout.id, status: "approved" })}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        환불 승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRefundStatus.mutate({ id: dropout.id, status: "rejected" })}
                        className="gap-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        환불 거절
                      </Button>
                    </div>
                  )}

                  {dropout.refund_status === "approved" && (
                    <Button
                      size="sm"
                      onClick={() => updateRefundStatus.mutate({ id: dropout.id, status: "completed" })}
                      className="gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      환불 완료 처리
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDropoutManagement;
