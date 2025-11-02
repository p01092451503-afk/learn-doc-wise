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
import { Plus, BarChart3, FileDown, Eye, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const TeacherSatisfactionSurvey = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
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

  // 만족도 조사 목록 조회
  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ["satisfaction-surveys", selectedCourse],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let query = supabase
        .from("satisfaction_surveys")
        .select(`
          *,
          courses (title),
          satisfaction_responses (count)
        `)
        .order("created_at", { ascending: false });

      if (selectedCourse && selectedCourse !== "all") {
        query = query.eq("course_id", selectedCourse);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // 만족도 조사 생성
  const createSurvey = useMutation({
    mutationFn: async (formData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("satisfaction_surveys")
        .insert({
          ...formData,
          created_by: user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["satisfaction-surveys"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "만족도 조사 생성 완료",
        description: "새로운 만족도 조사가 생성되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "생성 실패",
        description: "만족도 조사 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleCreateSurvey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createSurvey.mutate({
      course_id: formData.get("course_id"),
      title: formData.get("title"),
      description: formData.get("description"),
      survey_type: formData.get("survey_type"),
      questions: [
        { type: "rating", question: "강의 내용에 만족하십니까?", scale: 5 },
        { type: "rating", question: "강사의 교수법은 어떠했습니까?", scale: 5 },
        { type: "rating", question: "교육 환경은 적절했습니까?", scale: 5 },
        { type: "text", question: "개선이 필요한 점을 말씀해주세요." },
      ],
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      is_active: true,
    });
  };

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-violet-500" />
              만족도 조사
            </h1>
            <p className="text-muted-foreground mt-2">
              중간/최종 만족도 조사를 생성하고 결과를 확인하세요
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                만족도 조사 생성
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleCreateSurvey}>
                <DialogHeader>
                  <DialogTitle>새 만족도 조사 생성</DialogTitle>
                  <DialogDescription>
                    만족도 조사 정보를 입력하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="course_id">강의 선택</Label>
                    <Select name="course_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="강의를 선택하세요" />
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
                    <Label htmlFor="title">제목</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="예: 중간 만족도 조사"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="survey_type">조사 유형</Label>
                    <Select name="survey_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mid">중간 만족도</SelectItem>
                        <SelectItem value="final">최종 만족도</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="만족도 조사에 대한 설명을 입력하세요"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">시작일</Label>
                      <Input
                        id="start_date"
                        name="start_date"
                        type="date"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">종료일</Label>
                      <Input
                        id="end_date"
                        name="end_date"
                        type="date"
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createSurvey.isPending}>
                    생성하기
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
            <div className="flex gap-4">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
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
            </div>
          </CardContent>
        </Card>

        {/* 만족도 조사 목록 */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                로딩 중...
              </CardContent>
            </Card>
          ) : surveys.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                만족도 조사가 없습니다. 새로 생성해보세요.
              </CardContent>
            </Card>
          ) : (
            surveys.map((survey: any) => (
              <Card key={survey.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{survey.title}</CardTitle>
                      <CardDescription>
                        {survey.courses?.title} • {survey.survey_type === "mid" ? "중간" : "최종"} 만족도
                      </CardDescription>
                    </div>
                    <Badge variant={survey.is_active ? "default" : "secondary"}>
                      {survey.is_active ? "진행중" : "종료"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">조사 기간: </span>
                      {new Date(survey.start_date).toLocaleDateString()} ~ {new Date(survey.end_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">응답: </span>
                      <span className="font-semibold">{survey.satisfaction_responses?.[0]?.count || 0}명</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      결과 보기
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      통계
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileDown className="h-4 w-4" />
                      엑셀 다운로드
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherSatisfactionSurvey;
