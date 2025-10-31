import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Clock, CheckCircle2, Lock, Target } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const mockEnrolledPaths = [
  {
    id: '1',
    learning_path_id: '550e8400-e29b-41d4-a716-446655440001',
    progress_percentage: 25,
    started_at: new Date().toISOString(),
    completed_at: null,
    learning_paths: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'React 기초부터 고급까지',
      description: 'React의 기초부터 고급 개념까지 단계별로 학습합니다',
      difficulty_level: 'beginner',
      estimated_hours: 40,
      learning_objectives: ['컴포넌트 기초 이해', 'Hooks 마스터하기', '상태 관리 학습', '성능 최적화'],
      is_active: true,
    }
  }
];

const mockAvailablePaths = [
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'TypeScript 완벽 가이드',
    description: 'TypeScript의 모든 것을 배우는 완벽한 학습 경로',
    difficulty_level: 'intermediate',
    estimated_hours: 30,
    learning_objectives: ['타입 시스템 이해', '제네릭 활용', '고급 타입 기법', '실전 프로젝트'],
    is_active: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Full-Stack 개발자 되기',
    description: '프론트엔드부터 백엔드까지 풀스택 개발 역량 키우기',
    difficulty_level: 'advanced',
    estimated_hours: 80,
    learning_objectives: ['프론트엔드 마스터', 'Node.js & Express', 'Database 설계', 'DevOps 기초'],
    is_active: true,
  }
];

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_hours: number;
  learning_objectives: string[];
  is_active: boolean;
}

interface UserLearningPath {
  id: string;
  learning_path_id: string;
  progress_percentage: number;
  started_at: string;
  completed_at: string | null;
  learning_paths: LearningPath;
}

export default function StudentLearningPath() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemoMode = searchParams.has('role');
  const [loading, setLoading] = useState(!isDemoMode);
  const [availablePaths, setAvailablePaths] = useState<LearningPath[]>([]);
  const [enrolledPaths, setEnrolledPaths] = useState<UserLearningPath[]>([]);

  useEffect(() => {
    if (isDemoMode) {
      // 데모 모드에서는 하드코딩된 데이터 사용
      setEnrolledPaths(mockEnrolledPaths as any);
      setAvailablePaths(mockAvailablePaths);
      setLoading(false);
    } else {
      loadData();
    }
  }, [isDemoMode]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 등록된 학습 경로 로드
      const { data: enrolled } = await supabase
        .from("user_learning_paths")
        .select(`
          *,
          learning_paths (*)
        `)
        .eq("user_id", user.id);

      setEnrolledPaths(enrolled || []);

      // 등록되지 않은 활성 학습 경로 로드
      const enrolledIds = enrolled?.map(e => e.learning_path_id) || [];
      const { data: available } = await supabase
        .from("learning_paths")
        .select("*")
        .eq("is_active", true)
        .not("id", "in", `(${enrolledIds.join(",") || "null"})`);

      setAvailablePaths(available || []);
    } catch (error) {
      console.error("Error loading learning paths:", error);
      toast({
        title: "오류",
        description: "학습 경로를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const enrollInPath = async (pathId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_learning_paths")
        .insert({
          user_id: user.id,
          learning_path_id: pathId,
          started_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "등록 완료",
        description: "학습 경로에 성공적으로 등록되었습니다.",
      });

      loadData();
    } catch (error) {
      console.error("Error enrolling:", error);
      toast({
        title: "오류",
        description: "학습 경로 등록에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner": return "bg-green-500";
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner": return "초급";
      case "intermediate": return "중급";
      case "advanced": return "고급";
      default: return level;
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="student">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">맞춤형 학습 경로</h1>
          <p className="text-muted-foreground">
            체계적인 학습 경로를 따라 목표를 달성하세요
          </p>
        </div>

      {/* 진행 중인 학습 경로 */}
      {enrolledPaths.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">내 학습 경로</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {enrolledPaths.map((enrollment) => (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{enrollment.learning_paths.title}</CardTitle>
                      <CardDescription>
                        {enrollment.learning_paths.description}
                      </CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(enrollment.learning_paths.difficulty_level)}>
                      {getDifficultyText(enrollment.learning_paths.difficulty_level)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{enrollment.learning_paths.estimated_hours}시간</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{enrollment.learning_paths.learning_objectives?.length || 0}개 목표</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>진행률</span>
                      <span className="font-semibold">{Math.round(enrollment.progress_percentage)}%</span>
                    </div>
                    <Progress value={enrollment.progress_percentage} />
                  </div>

                  {enrollment.completed_at ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">완료!</span>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => {
                        if (isDemoMode) {
                          toast({
                            title: "데모 모드",
                            description: "실제 서비스에 가입하시면 학습 경로 상세 페이지를 이용하실 수 있습니다.",
                          });
                        } else {
                          navigate(`/student/learning-path/${enrollment.learning_path_id}`);
                        }
                      }}
                    >
                      학습 계속하기
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 등록 가능한 학습 경로 */}
      {availablePaths.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">추천 학습 경로</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {availablePaths.map((path) => (
              <Card key={path.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{path.title}</CardTitle>
                      <CardDescription>{path.description}</CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(path.difficulty_level)}>
                      {getDifficultyText(path.difficulty_level)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{path.estimated_hours}시간</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{path.learning_objectives?.length || 0}개 목표</span>
                    </div>
                  </div>

                  {path.learning_objectives && path.learning_objectives.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">학습 목표:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {path.learning_objectives.slice(0, 3).map((objective, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{objective}</span>
                          </li>
                        ))}
                        {path.learning_objectives.length > 3 && (
                          <li className="text-xs">+{path.learning_objectives.length - 3}개 더...</li>
                        )}
                      </ul>
                    </div>
                  )}

                  <Button 
                    className="w-full"
                    onClick={() => {
                      if (isDemoMode) {
                        toast({
                          title: "데모 모드",
                          description: "실제 서비스에 가입하시면 학습 경로를 시작하실 수 있습니다.",
                        });
                      } else {
                        enrollInPath(path.id);
                      }
                    }}
                  >
                    학습 시작하기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {enrolledPaths.length === 0 && availablePaths.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">현재 이용 가능한 학습 경로가 없습니다.</p>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  );
}
