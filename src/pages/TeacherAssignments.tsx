import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { FileText, Clock, CheckCircle, AlertCircle, Plus, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  max_score: number;
  status: string;
  course_id: string;
  courses: {
    title: string;
  };
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text: string | null;
  submitted_at: string;
  status: string;
  score: number | null;
  profiles: {
    full_name: string | null;
  };
}

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    course_id: "",
    max_score: 100,
    due_date: "",
    status: "draft",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [assignmentsResult, coursesResult, submissionsResult] = await Promise.all([
        supabase
          .from("assignments")
          .select(`
            *,
            courses(title)
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("courses")
          .select("id, title")
          .eq("instructor_id", user.id),
        supabase
          .from("assignment_submissions")
          .select(`
            *,
            profiles:student_id(full_name)
          `)
          .order("submitted_at", { ascending: false })
          .limit(20),
      ]);

      if (assignmentsResult.error) throw assignmentsResult.error;
      if (coursesResult.error) throw coursesResult.error;
      if (submissionsResult.error) throw submissionsResult.error;

      setAssignments(assignmentsResult.data as any || []);
      setCourses(coursesResult.data || []);
      setSubmissions(submissionsResult.data as any || []);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("assignments").insert([{
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        course_id: formData.course_id,
        max_score: formData.max_score,
        due_date: formData.due_date || null,
        status: formData.status as "draft" | "published" | "closed",
        created_by: user?.id,
      }]);

      if (error) throw error;

      toast({
        title: "성공",
        description: "과제가 생성되었습니다.",
      });

      setIsDialogOpen(false);
      fetchData();
      setFormData({
        title: "",
        description: "",
        instructions: "",
        course_id: "",
        max_score: 100,
        due_date: "",
        status: "draft",
      });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "과제 생성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("assignment_submissions")
        .update({
          score: gradeScore,
          feedback: gradeFeedback,
          status: "graded",
          graded_by: user?.id,
          graded_at: new Date().toISOString(),
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      toast({
        title: "성공",
        description: "채점이 완료되었습니다.",
      });

      setSelectedSubmission(null);
      setGradeScore(0);
      setGradeFeedback("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "채점에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === "submitted");

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">과제 관리</h1>
            <p className="text-muted-foreground">
              과제를 생성하고 학생들의 제출물을 평가하세요
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                새 과제 만들기
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>새 과제 생성</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>과제명 *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="예: React Hooks 실습"
                  />
                </div>
                <div className="space-y-2">
                  <Label>강좌 선택 *</Label>
                  <Select value={formData.course_id} onValueChange={(value) => setFormData({ ...formData, course_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="강좌를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>설명</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="과제 설명"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>지시사항</Label>
                  <Textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="과제 지시사항"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>배점</Label>
                    <Input
                      type="number"
                      value={formData.max_score}
                      onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>마감일</Label>
                    <Input
                      type="datetime-local"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">초안</SelectItem>
                      <SelectItem value="published">공개</SelectItem>
                      <SelectItem value="closed">마감</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleCreateAssignment}>생성</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap">전체 과제</CardTitle>
              <div className="text-muted-foreground flex-shrink-0">
                <FileText className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1 min-w-0">
              <div className="text-xl font-bold break-all">{assignments.length}</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">생성된 과제</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap">채점 대기</CardTitle>
              <div className="text-muted-foreground flex-shrink-0">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1 min-w-0">
              <div className="text-xl font-bold break-all">{pendingSubmissions.length}</div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">검토 필요</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap">채점 완료</CardTitle>
              <div className="text-muted-foreground flex-shrink-0">
                <CheckCircle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1 min-w-0">
              <div className="text-xl font-bold break-all">
                {submissions.filter(s => s.status === "graded").length}
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">총 채점</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium whitespace-nowrap">평균 점수</CardTitle>
              <div className="text-muted-foreground flex-shrink-0">
                <AlertCircle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1 min-w-0">
              <div className="text-xl font-bold break-all">
                {submissions.filter(s => s.score).length > 0
                  ? Math.round(
                      submissions
                        .filter(s => s.score)
                        .reduce((sum, s) => sum + (s.score || 0), 0) /
                        submissions.filter(s => s.score).length
                    )
                  : 0}점
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">전체 평균</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>과제 목록</CardTitle>
            <CardDescription>생성된 모든 과제</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>과제명</TableHead>
                  <TableHead>강의</TableHead>
                  <TableHead>마감일</TableHead>
                  <TableHead>배점</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {assignment.courses?.title}
                    </TableCell>
                    <TableCell className="text-sm">
                      {assignment.due_date
                        ? new Date(assignment.due_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{assignment.max_score}점</TableCell>
                    <TableCell>
                      <Badge variant={assignment.status === "published" ? "default" : "secondary"}>
                        {assignment.status === "published" ? "공개" : assignment.status === "closed" ? "마감" : "초안"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        보기
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 제출</CardTitle>
            <CardDescription>채점이 필요한 제출물</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingSubmissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">채점 대기 중인 제출물이 없습니다.</p>
              ) : (
                pendingSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {submission.profiles?.full_name?.[0] || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{submission.profiles?.full_name || "이름 없음"}</p>
                        <p className="text-sm text-muted-foreground">
                          제출: {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">채점 대기</Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setGradeScore(0);
                              setGradeFeedback("");
                            }}
                          >
                            채점하기
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>과제 채점</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label>학생</Label>
                              <p className="font-medium mt-1">{submission.profiles?.full_name}</p>
                            </div>
                            <div>
                              <Label>제출 내용</Label>
                              <div className="mt-2 p-4 bg-muted rounded-lg text-sm">
                                {submission.submission_text || "제출 내용 없음"}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>점수 *</Label>
                              <Input
                                type="number"
                                value={gradeScore}
                                onChange={(e) => setGradeScore(parseInt(e.target.value) || 0)}
                                placeholder="점수 입력"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>피드백</Label>
                              <Textarea
                                value={gradeFeedback}
                                onChange={(e) => setGradeFeedback(e.target.value)}
                                placeholder="학생에게 전달할 피드백을 입력하세요"
                                rows={4}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                              취소
                            </Button>
                            <Button onClick={handleGradeSubmission}>채점 완료</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherAssignments;
