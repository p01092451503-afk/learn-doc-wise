import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, Circle, Lock, PlayCircle, BookOpen, FileText, Video } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

interface LearningPathStep {
  id: string;
  step_order: number;
  title: string;
  description: string;
  content_type: string;
  content_id: string | null;
  estimated_minutes: number;
  is_required: boolean;
}

interface UserStepProgress {
  id: string;
  step_id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_hours: number;
  learning_objectives: string[];
}

interface UserLearningPath {
  id: string;
  progress_percentage: number;
  completed_at: string | null;
}

export default function StudentLearningPathDetail() {
  const { id: pathId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<LearningPath | null>(null);
  const [userPath, setUserPath] = useState<UserLearningPath | null>(null);
  const [steps, setSteps] = useState<LearningPathStep[]>([]);
  const [progress, setProgress] = useState<Record<string, UserStepProgress>>({});

  useEffect(() => {
    loadData();
  }, [pathId]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 학습 경로 정보 로드
      const { data: pathData, error: pathError } = await supabase
        .from("learning_paths")
        .select("*")
        .eq("id", pathId)
        .maybeSingle();

      if (pathError) throw pathError;
      setPath(pathData);

      // 사용자 학습 경로 등록 정보
      const { data: userPathData } = await supabase
        .from("user_learning_paths")
        .select("*")
        .eq("user_id", user.id)
        .eq("learning_path_id", pathId)
        .maybeSingle();

      setUserPath(userPathData);

      // 학습 경로 단계들 로드
      const { data: stepsData } = await supabase
        .from("learning_path_steps")
        .select("*")
        .eq("learning_path_id", pathId)
        .order("step_order", { ascending: true });

      setSteps(stepsData || []);

      // 사용자 진행 상황 로드
      if (userPathData) {
        const { data: progressData } = await supabase
          .from("user_learning_path_progress")
          .select("*")
          .eq("user_learning_path_id", userPathData.id);

        const progressMap: Record<string, UserStepProgress> = {};
        progressData?.forEach(p => {
          progressMap[p.step_id] = p;
        });
        setProgress(progressMap);
      }
    } catch (error) {
      console.error("Error loading learning path:", error);
      toast({
        title: "오류",
        description: "학습 경로 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startStep = async (stepId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !userPath) return;

      const { error } = await supabase
        .from("user_learning_path_progress")
        .insert({
          user_learning_path_id: userPath.id,
          step_id: stepId,
          status: "in_progress",
          started_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "시작!",
        description: "학습 단계를 시작했습니다.",
      });

      loadData();
    } catch (error) {
      console.error("Error starting step:", error);
    }
  };

  const completeStep = async (stepId: string) => {
    try {
      const stepProgress = progress[stepId];
      if (!stepProgress) return;

      const { error } = await supabase
        .from("user_learning_path_progress")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", stepProgress.id);

      if (error) throw error;

      toast({
        title: "완료!",
        description: "학습 단계를 완료했습니다.",
      });

      loadData();
    } catch (error) {
      console.error("Error completing step:", error);
    }
  };

  const getStepIcon = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case "video": return <Video className="h-5 w-5" />;
      case "reading": return <BookOpen className="h-5 w-5" />;
      case "quiz": return <FileText className="h-5 w-5" />;
      case "assignment": return <FileText className="h-5 w-5" />;
      default: return <Circle className="h-5 w-5" />;
    }
  };

  const getStepStatus = (stepId: string) => {
    const stepProgress = progress[stepId];
    if (!stepProgress) return "not_started";
    return stepProgress.status;
  };

  const isStepLocked = (stepIndex: number) => {
    if (stepIndex === 0) return false;
    const previousStep = steps[stepIndex - 1];
    return getStepStatus(previousStep.id) !== "completed";
  };

  if (loading) {
    return (
      <DashboardLayout userRole="student">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!path) {
    return (
      <DashboardLayout userRole="student">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">학습 경로를 찾을 수 없습니다.</p>
          <Button onClick={() => navigate("/student/learning-path")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/student/learning-path")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        돌아가기
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{path.title}</CardTitle>
              <CardDescription className="mt-2">{path.description}</CardDescription>
            </div>
            {userPath && (
              <Badge variant={userPath.completed_at ? "default" : "secondary"}>
                {userPath.completed_at ? "완료" : `진행 중 ${Math.round(userPath.progress_percentage)}%`}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {userPath && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>전체 진행률</span>
                <span className="font-semibold">{Math.round(userPath.progress_percentage)}%</span>
              </div>
              <Progress value={userPath.progress_percentage} />
            </div>
          )}

          {path.learning_objectives && path.learning_objectives.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">학습 목표</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {path.learning_objectives.map((objective, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">학습 단계</h2>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const locked = isStepLocked(index);
          const stepProgress = progress[step.id];

          return (
            <Card key={step.id} className={locked ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {status === "completed" ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : locked ? (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Step {step.step_order}
                      </span>
                      {getStepIcon(step.content_type)}
                      <Badge variant="outline">{step.content_type}</Badge>
                      {step.is_required && (
                        <Badge variant="secondary">필수</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    {step.description && (
                      <CardDescription className="mt-2">{step.description}</CardDescription>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      예상 소요 시간: {step.estimated_minutes}분
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {locked ? (
                  <p className="text-sm text-muted-foreground">
                    이전 단계를 완료해야 잠금이 해제됩니다.
                  </p>
                ) : status === "completed" ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">완료!</span>
                  </div>
                ) : status === "in_progress" ? (
                  <Button onClick={() => completeStep(step.id)}>
                    완료 표시
                  </Button>
                ) : (
                  <Button onClick={() => startStep(step.id)}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    시작하기
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      </div>
    </DashboardLayout>
  );
}
