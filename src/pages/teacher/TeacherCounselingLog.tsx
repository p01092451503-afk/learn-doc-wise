import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, User, AlertCircle, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const TeacherCounselingLog = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
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

  // 학생 목록 조회 (선택된 강의 기준)
  const { data: students = [] } = useQuery({
    queryKey: ["course-students", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          user_id,
          profiles:user_id (full_name)
        `)
        .eq("course_id", selectedCourse);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCourse,
  });

  // 상담일지 목록 조회
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["counseling-logs", selectedCourse],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let query = supabase
        .from("counseling_logs")
        .select(`
          *,
          courses (title),
          profiles:student_id (full_name)
        `)
        .eq("counselor_id", user?.id)
        .order("counseling_date", { ascending: false });

      if (selectedCourse) {
        query = query.eq("course_id", selectedCourse);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // 상담일지 생성
  const createLog = useMutation({
    mutationFn: async (formData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("counseling_logs")
        .insert({
          ...formData,
          counselor_id: user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counseling-logs"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "상담일지 작성 완료",
        description: "상담일지가 성공적으로 저장되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "작성 실패",
        description: "상담일지 작성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleCreateLog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createLog.mutate({
      course_id: formData.get("course_id"),
      student_id: formData.get("student_id"),
      counseling_type: formData.get("counseling_type"),
      counseling_date: formData.get("counseling_date"),
      summary: formData.get("summary"),
      student_concerns: formData.get("student_concerns"),
      counselor_advice: formData.get("counselor_advice"),
      follow_up_needed: formData.get("follow_up_needed") === "on",
      follow_up_date: formData.get("follow_up_date") || null,
      is_confidential: formData.get("is_confidential") === "on",
    });
  };

  const counselingTypes = [
    { value: "career", label: "진로 상담" },
    { value: "learning", label: "학습 상담" },
    { value: "life", label: "생활 상담" },
    { value: "employment", label: "취업 상담" },
  ];

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ClipboardList className="h-8 w-8 text-violet-500" />
              상담일지
            </h1>
            <p className="text-muted-foreground mt-2">
              훈련생 상담 내용을 기록하고 관리하세요
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                상담일지 작성
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleCreateLog}>
                <DialogHeader>
                  <DialogTitle>상담일지 작성</DialogTitle>
                  <DialogDescription>
                    상담 내용을 상세히 기록하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course_id">강의</Label>
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
                      <Label htmlFor="student_id">학생</Label>
                      <Select name="student_id" required disabled={!selectedCourse}>
                        <SelectTrigger>
                          <SelectValue placeholder="학생 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((enrollment: any) => (
                            <SelectItem key={enrollment.user_id} value={enrollment.user_id}>
                              {enrollment.profiles?.full_name || "이름 없음"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="counseling_type">상담 유형</Label>
                      <Select name="counseling_type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="유형 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {counselingTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="counseling_date">상담일</Label>
                      <Input
                        id="counseling_date"
                        name="counseling_date"
                        type="datetime-local"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">상담 요약</Label>
                    <Input
                      id="summary"
                      name="summary"
                      placeholder="상담 내용을 한 줄로 요약하세요"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student_concerns">학생 고민/문제</Label>
                    <Textarea
                      id="student_concerns"
                      name="student_concerns"
                      placeholder="학생이 토로한 고민이나 문제점을 기록하세요"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="counselor_advice">상담 내용 및 조언</Label>
                    <Textarea
                      id="counselor_advice"
                      name="counselor_advice"
                      placeholder="제공한 조언이나 해결 방안을 기록하세요"
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="follow_up_needed" name="follow_up_needed" />
                    <Label htmlFor="follow_up_needed">후속 조치 필요</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="follow_up_date">후속 조치 예정일</Label>
                    <Input
                      id="follow_up_date"
                      name="follow_up_date"
                      type="date"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="is_confidential" name="is_confidential" />
                    <Label htmlFor="is_confidential">비공개 상담 (학생에게 비공개)</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createLog.isPending}>
                    저장하기
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

        {/* 상담일지 목록 */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                로딩 중...
              </CardContent>
            </Card>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                상담일지가 없습니다. 새로 작성해보세요.
              </CardContent>
            </Card>
          ) : (
            logs.map((log: any) => (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{log.summary}</CardTitle>
                      <CardDescription>
                        <span className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4" />
                          {log.profiles?.full_name} • {log.courses?.title}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge>
                        {counselingTypes.find(t => t.value === log.counseling_type)?.label}
                      </Badge>
                      {log.is_confidential && (
                        <Badge variant="secondary">비공개</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(log.counseling_date).toLocaleString()}
                  </div>
                  {log.student_concerns && (
                    <div>
                      <p className="text-sm font-semibold mb-1">학생 고민:</p>
                      <p className="text-sm text-muted-foreground">{log.student_concerns}</p>
                    </div>
                  )}
                  {log.counselor_advice && (
                    <div>
                      <p className="text-sm font-semibold mb-1">상담 조언:</p>
                      <p className="text-sm text-muted-foreground">{log.counselor_advice}</p>
                    </div>
                  )}
                  {log.follow_up_needed && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                      <AlertCircle className="h-4 w-4" />
                      후속 조치 필요
                      {log.follow_up_date && ` (${new Date(log.follow_up_date).toLocaleDateString()})`}
                    </div>
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

export default TeacherCounselingLog;
