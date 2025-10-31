import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { FileText, Clock, CheckCircle2, AlertCircle, Upload } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  max_score: number;
  status: string;
  courses: {
    title: string;
  };
}

interface Submission {
  id: string;
  assignment_id: string;
  submission_text: string | null;
  submitted_at: string;
  status: string;
  score: number | null;
  feedback: string | null;
  assignments: {
    title: string;
    max_score: number;
  };
}

const StudentAssignments = () => {
  const [searchParams] = useSearchParams();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const { toast } = useToast();

  const demoRole = searchParams.get('role') as "student" | "teacher" | "admin" | null;
  const isDemo = !!demoRole;

  useEffect(() => {
    if (!isDemo) {
      fetchData();
    } else {
      setMockDemoData();
      setLoading(false);
    }
  }, [isDemo]);

  const setMockDemoData = () => {
    const mockAssignments: Assignment[] = [
      {
        id: 'assign-1',
        title: 'React Hooks 실습 과제',
        description: 'useState, useEffect, useContext를 활용한 간단한 Todo 앱을 만들어보세요. AI 튜터가 코드 리뷰를 제공합니다.',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        max_score: 100,
        status: 'published',
        courses: { title: 'AI 기반 웹 개발 마스터' }
      },
      {
        id: 'assign-2',
        title: 'Python 데이터 분석',
        description: '판다스와 넘파이를 사용하여 주어진 데이터셋을 분석하세요. AI가 자동으로 코드 품질을 평가합니다.',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        max_score: 100,
        status: 'published',
        courses: { title: 'Python AI 프로그래밍' }
      },
      {
        id: 'assign-3',
        title: '머신러닝 모델 구현',
        description: 'Scikit-learn을 사용하여 분류 모델을 만들고 평가하세요.',
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        max_score: 150,
        status: 'published',
        courses: { title: '머신러닝 실전 프로젝트' }
      },
    ];

    const mockSubmissions: Submission[] = [
      {
        id: 'sub-1',
        assignment_id: 'assign-3',
        submission_text: '머신러닝 분류 모델을 구현했습니다. RandomForest 알고리즘을 사용하여 85%의 정확도를 달성했습니다.',
        submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'graded',
        score: 142,
        feedback: 'AI 자동 채점: 코드 구조가 우수하며, 모델 성능도 뛰어납니다. 다만 데이터 전처리 부분에서 약간의 개선이 필요합니다. 하이퍼파라미터 튜닝도 고려해보세요.',
        assignments: { title: '머신러닝 모델 구현', max_score: 150 }
      },
      {
        id: 'sub-2',
        assignment_id: 'assign-1',
        submission_text: 'React Hooks를 활용한 Todo 앱을 완성했습니다. useState로 상태 관리하고 useEffect로 로컬 스토리지 연동했습니다.',
        submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'submitted',
        score: null,
        feedback: null,
        assignments: { title: 'React Hooks 실습 과제', max_score: 100 }
      },
    ];

    setAssignments(mockAssignments);
    setSubmissions(mockSubmissions);
  };

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [assignmentsResult, submissionsResult] = await Promise.all([
        supabase
          .from("assignments")
          .select(`
            *,
            courses(title)
          `)
          .eq("status", "published")
          .order("due_date", { ascending: true }),
        supabase
          .from("assignment_submissions")
          .select(`
            *,
            assignments(title, max_score)
          `)
          .eq("student_id", user.id)
          .order("submitted_at", { ascending: false }),
      ]);

      if (assignmentsResult.error) throw assignmentsResult.error;
      if (submissionsResult.error) throw submissionsResult.error;

      setAssignments(assignmentsResult.data as any || []);
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

  const handleSubmit = async () => {
    if (!selectedAssignment || !submissionText.trim()) {
      toast({
        title: "오류",
        description: "과제 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const { error } = await supabase.from("assignment_submissions").insert([{
        assignment_id: selectedAssignment.id,
        student_id: user.id,
        submission_text: submissionText,
      }]);

      if (error) throw error;

      toast({
        title: "성공",
        description: "과제가 제출되었습니다.",
      });

      setSelectedAssignment(null);
      setSubmissionText("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "제출에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const getDaysLeft = (dueDate: string | null) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const submittedAssignmentIds = new Set(submissions.map(s => s.assignment_id));
  const pendingAssignments = assignments.filter(a => !submittedAssignmentIds.has(a.id));
  const completedSubmissions = submissions.filter(s => s.status === "graded");

  const avgScore = completedSubmissions.length > 0
    ? completedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSubmissions.length
    : 0;

  const urgentCount = pendingAssignments.filter(a => {
    const daysLeft = getDaysLeft(a.due_date);
    return daysLeft !== null && daysLeft <= 3;
  }).length;

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            과제
            {isDemo && <Badge variant="default" className="text-xs">AI</Badge>}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isDemo 
              ? 'AI 자동 채점으로 즉시 피드백을 받고 학습을 개선하세요'
              : '제출할 과제를 확인하고 관리하세요'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    제출 대기
                  </p>
                  <p className="text-3xl font-bold mt-2">{pendingAssignments.length}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    완료한 과제
                  </p>
                  <p className="text-3xl font-bold mt-2">{submissions.length}</p>
                </div>
                <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    평균 점수
                  </p>
                  <p className="text-3xl font-bold mt-2">{Math.round(avgScore)}점</p>
                </div>
                <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    긴급 과제
                  </p>
                  <p className="text-3xl font-bold mt-2 text-destructive">{urgentCount}</p>
                </div>
                <div className="h-12 w-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pending">제출 대기</TabsTrigger>
            <TabsTrigger value="completed">완료됨</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6 space-y-4">
            {pendingAssignments.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">제출 대기 중인 과제가 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              pendingAssignments.map((assignment) => {
                const daysLeft = getDaysLeft(assignment.due_date);
                const isUrgent = daysLeft !== null && daysLeft <= 3;

                return (
                  <Card
                    key={assignment.id}
                    className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {assignment.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {assignment.courses?.title}
                          </p>
                        </div>
                        <Badge variant={isUrgent ? "destructive" : "secondary"}>
                          {isUrgent ? "긴급" : "진행중"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className={isUrgent ? "text-destructive font-medium" : ""}>
                              {daysLeft !== null ? `${daysLeft}일 남음` : "마감일 없음"}
                              {assignment.due_date && ` (${new Date(assignment.due_date).toLocaleDateString()})`}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            배점: {assignment.max_score}점
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedAssignment(assignment)}>
                              과제 제출하기
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>과제 제출</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <h4 className="font-semibold mb-2">{assignment.title}</h4>
                                <p className="text-sm text-muted-foreground">{assignment.description}</p>
                              </div>
                              <div className="space-y-2">
                                <Label>과제 내용 *</Label>
                                <Textarea
                                  value={submissionText}
                                  onChange={(e) => setSubmissionText(e.target.value)}
                                  placeholder="과제 내용을 입력하세요"
                                  rows={8}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                                취소
                              </Button>
                              <Button onClick={handleSubmit}>
                                <Upload className="h-4 w-4 mr-2" />
                                제출
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6 space-y-4">
            {completedSubmissions.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">완료된 과제가 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              completedSubmissions.map((submission) => (
                <Card
                  key={submission.id}
                  className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <CardHeader>
                     <div className="flex items-start justify-between">
                       <div className="space-y-1">
                         <CardTitle className="text-lg flex items-center gap-2">
                           {submission.assignments?.title}
                           {isDemo && submission.feedback?.includes('AI') && (
                             <Badge variant="default" className="text-[10px] px-1.5 py-0">AI 채점</Badge>
                           )}
                         </CardTitle>
                       </div>
                       <Badge variant="default" className="bg-accent">
                         {submission.score || 0}점
                       </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>제출일: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                        </div>
                        <div>배점: {submission.assignments?.max_score}점</div>
                      </div>
                      {submission.feedback && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline">피드백 보기</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>과제 피드백</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label>점수</Label>
                                <p className="text-2xl font-bold text-primary mt-1">
                                  {submission.score} / {submission.assignments?.max_score}
                                </p>
                              </div>
                              <div>
                                <Label>강사 피드백</Label>
                                <p className="text-sm mt-2 p-4 bg-muted rounded-lg">
                                  {submission.feedback}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignments;
