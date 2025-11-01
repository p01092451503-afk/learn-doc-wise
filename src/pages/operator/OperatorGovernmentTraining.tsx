import { useState } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  FileText,
  Users,
  ClipboardCheck,
  MessageSquare,
  Award,
  DollarSign,
  Link as LinkIcon,
  BarChart3,
  Eye,
  EyeOff,
  Settings
} from "lucide-react";

interface Feature {
  id: string;
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "very-hard";
  status: "done" | "in-progress" | "planned" | "blocked";
  priority: "high" | "medium" | "low";
  category: string;
  estimatedDays: number;
  dependencies?: string[];
  icon: any;
  details: string[];
}

const OperatorGovernmentTraining = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // HRD 기능 데이터 가져오기
  const { data: hrdFeatures = [], isLoading } = useQuery({
    queryKey: ["hrd-features"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hrd_features")
        .select("*")
        .order("role", { ascending: true })
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // HRD 기능 토글
  const toggleFeature = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("hrd_features")
        .update({ is_enabled: enabled })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hrd-features"] });
      toast({
        title: "설정 변경 완료",
        description: "HRD 기능 노출 설정이 업데이트되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "설정 변경 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const features: Feature[] = [
    // 이미 구현된 기능들
    {
      id: "attendance",
      name: "출결 관리",
      description: "IP 기반 출석 체크, 지각/조퇴/결석 관리",
      difficulty: "easy",
      status: "done",
      priority: "high",
      category: "필수",
      estimatedDays: 0,
      icon: ClipboardCheck,
      details: [
        "✅ IP 기반 출석 체크 완료",
        "✅ 출석/지각/조퇴/결석 상태 관리",
        "✅ 강의별 출석 현황 조회",
        "✅ 출석률 자동 계산"
      ]
    },
    {
      id: "grades",
      name: "성적 관리",
      description: "과제 제출, 시험, 성적 입력 및 관리",
      difficulty: "easy",
      status: "done",
      priority: "high",
      category: "필수",
      estimatedDays: 0,
      icon: Award,
      details: [
        "✅ 과제 제출 시스템",
        "✅ 채점 및 피드백",
        "✅ 성적 입력 및 조회",
        "✅ 성적표 출력"
      ]
    },
    {
      id: "certificates",
      name: "수료증 발급",
      description: "수료 조건 확인 및 수료증 자동 발급",
      difficulty: "easy",
      status: "done",
      priority: "high",
      category: "필수",
      estimatedDays: 0,
      icon: Award,
      details: [
        "✅ 수료 조건 자동 체크",
        "✅ 수료증 생성",
        "✅ 수료증 다운로드",
        "✅ 수료증 이력 관리"
      ]
    },

    // 당장 개발 가능한 기능들
    {
      id: "training-log",
      name: "훈련일지 작성",
      description: "일일 훈련 내용, 교육방법, 과제 등 기록",
      difficulty: "easy",
      status: "done",
      priority: "high",
      category: "필수",
      estimatedDays: 0,
      icon: FileText,
      details: [
        "✅ 일일 훈련 내용 요약 작성",
        "✅ 교육 방법 (강의/실습/토론) 기록",
        "✅ 사용한 교재 및 자료 기록",
        "✅ 과제 및 특이사항 기록",
        "✅ 훈련시간 자동 계산",
        "✅ 월별/주별 훈련일지 조회"
      ]
    },
    {
      id: "satisfaction-survey",
      name: "만족도 조사",
      description: "중간/최종 만족도 조사 생성 및 관리",
      difficulty: "easy",
      status: "done",
      priority: "high",
      category: "필수",
      estimatedDays: 0,
      icon: MessageSquare,
      details: [
        "✅ 설문 템플릿 생성 (5점 척도, 객관식, 주관식)",
        "✅ 중간/최종 만족도 구분",
        "✅ 훈련생 설문 참여",
        "✅ 설문 결과 통계 및 시각화",
        "✅ 만족도 평균 점수 산출",
        "✅ 답변 엑셀 다운로드"
      ]
    },
    {
      id: "counseling-log",
      name: "상담일지",
      description: "훈련생 상담 내용 기록 및 관리",
      difficulty: "easy",
      status: "done",
      priority: "medium",
      category: "권장",
      estimatedDays: 0,
      icon: MessageSquare,
      details: [
        "✅ 상담 유형별 분류 (진로/학습/생활/취업)",
        "✅ 상담 내용 및 조언 기록",
        "✅ 후속 조치 필요 여부 체크",
        "✅ 비공개 상담 설정",
        "✅ 학생별 상담 이력 조회",
        "✅ 상담 통계 대시보드"
      ]
    },
    {
      id: "dropout-management",
      name: "중도탈락 관리",
      description: "중도탈락자 사유, 인터뷰, 환불 처리",
      difficulty: "medium",
      status: "done",
      priority: "high",
      category: "필수",
      estimatedDays: 0,
      icon: Users,
      details: [
        "✅ 탈락 사유 카테고리 관리",
        "✅ 탈락 상담 일지 작성",
        "✅ 환불 금액 자동 계산",
        "✅ 환불 승인 프로세스",
        "✅ 탈락자 통계",
        "✅ 증빙 서류 첨부"
      ]
    },

    // 중간 난이도 기능들
    {
      id: "attendance-detail",
      name: "출결 상세 관리",
      description: "지각/조퇴 시간 기록, 결석 사유, 증빙서류",
      difficulty: "medium",
      status: "done",
      priority: "high",
      category: "필수",
      estimatedDays: 0,
      icon: ClipboardCheck,
      details: [
        "✅ 지각/조퇴 분 단위 기록",
        "✅ 결석 사유 및 증빙서류 URL",
        "✅ 출결 승인 프로세스",
        "✅ 출석률 80% 자동 체크",
        "✅ 출결 통계 표시"
      ]
    },
    {
      id: "training-completion",
      name: "수료 요건 자동 체크",
      description: "출석률 80%, 성적 60점 자동 확인",
      difficulty: "medium",
      status: "done",
      priority: "high",
      category: "필수",
      estimatedDays: 0,
      dependencies: ["attendance-detail"],
      icon: Award,
      details: [
        "✅ 출석률 80% 이상 자동 확인",
        "✅ 평균 성적 60점 이상 확인",
        "✅ 수료 미달자 알림",
        "✅ 수료 예상자 목록",
        "✅ 수료 통계 대시보드"
      ]
    },
    {
      id: "training-allowance",
      name: "훈련수당 계산",
      description: "출석일 기반 훈련수당 자동 계산",
      difficulty: "medium",
      status: "done",
      priority: "medium",
      category: "권장",
      estimatedDays: 0,
      icon: DollarSign,
      details: [
        "✅ 출석일 기반 훈련수당 산출",
        "✅ 지급 대상자 필터링",
        "✅ 월별 훈련수당 집계",
        "✅ 훈련수당 지급 내역 관리",
        "✅ 엑셀 다운로드"
      ]
    },
    {
      id: "training-report",
      name: "훈련 진행 리포트",
      description: "과정별 진행 현황 종합 리포트 생성",
      difficulty: "medium",
      status: "done",
      priority: "medium",
      category: "권장",
      estimatedDays: 0,
      icon: BarChart3,
      details: [
        "✅ 과정별 훈련생 현황",
        "✅ 출석률 통계",
        "✅ 성적 분포",
        "✅ 만족도 조사 결과",
        "✅ 중도탈락 현황",
        "✅ PDF 리포트 생성"
      ]
    },

    // 어려운 기능들
    {
      id: "hrd-net-api",
      name: "HRD-Net API 연동",
      description: "한국산업인력공단 HRD-Net 시스템 연동",
      difficulty: "very-hard",
      status: "blocked",
      priority: "high",
      category: "고급",
      estimatedDays: 30,
      icon: LinkIcon,
      details: [
        "⚠️ 정부 시스템 API 승인 필요",
        "⚠️ 보안 인증서 발급 필요",
        "훈련생 정보 실시간 전송",
        "출결 데이터 자동 전송",
        "성적 데이터 자동 전송",
        "양방향 데이터 동기화"
      ]
    },
    {
      id: "employment-insurance",
      name: "고용보험 연동",
      description: "고용보험 시스템과 훈련비 청구 연동",
      difficulty: "very-hard",
      status: "blocked",
      priority: "medium",
      category: "고급",
      estimatedDays: 40,
      dependencies: ["hrd-net-api"],
      icon: LinkIcon,
      details: [
        "⚠️ 고용보험 공단 협의 필요",
        "⚠️ 법적 요건 검토 필요",
        "훈련비 청구 데이터 생성",
        "정산 내역 자동 전송",
        "환급 처리 연동"
      ]
    },
    {
      id: "digital-signature",
      name: "전자서명 시스템",
      description: "훈련일지, 상담일지 전자서명",
      difficulty: "hard",
      status: "planned",
      priority: "low",
      category: "고급",
      estimatedDays: 10,
      icon: Award,
      details: [
        "전자서명 API 연동",
        "강사/훈련생 서명",
        "서명 이력 관리",
        "법적 효력 보장",
        "PDF 서명 문서 생성"
      ]
    }
  ];

  const difficultyColors = {
    "easy": "bg-green-500",
    "medium": "bg-yellow-500",
    "hard": "bg-orange-500",
    "very-hard": "bg-red-500"
  };

  const difficultyLabels = {
    "easy": "쉬움",
    "medium": "중간",
    "hard": "어려움",
    "very-hard": "매우 어려움"
  };

  const statusColors = {
    "done": "bg-green-500",
    "in-progress": "bg-blue-500",
    "planned": "bg-gray-500",
    "blocked": "bg-red-500"
  };

  const statusLabels = {
    "done": "완료",
    "in-progress": "개발중",
    "planned": "계획됨",
    "blocked": "보류"
  };

  const categories = ["all", "필수", "권장", "고급"];

  const filteredFeatures = selectedCategory === "all"
    ? features
    : features.filter(f => f.category === selectedCategory);

  const stats = {
    total: features.length,
    done: features.filter(f => f.status === "done").length,
    inProgress: features.filter(f => f.status === "in-progress").length,
    planned: features.filter(f => f.status === "planned").length,
    blocked: features.filter(f => f.status === "blocked").length
  };

  const completionRate = (stats.done / stats.total) * 100;

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">국비환급과정 기능 관리</h1>
          <p className="text-muted-foreground mt-2">
            국비환급과정 운영에 필요한 모든 기능의 개발 현황과 노출 설정을 관리합니다
          </p>
        </div>

        <Tabs defaultValue="development" className="space-y-6">
          <TabsList>
            <TabsTrigger value="development" className="gap-2">
              <Sparkles className="h-4 w-4" />
              기능 개발 현황
            </TabsTrigger>
            <TabsTrigger value="visibility" className="gap-2">
              <Settings className="h-4 w-4" />
              HRD 기능 노출 관리
            </TabsTrigger>
          </TabsList>

          {/* 기능 개발 현황 탭 */}
          <TabsContent value="development" className="space-y-6">

        {/* 통계 카드 */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                전체 기능
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}개</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                완료
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.done}개</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">
                개발중
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}개</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                계획됨
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.planned}개</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                보류
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.blocked}개</div>
            </CardContent>
          </Card>
        </div>

        {/* 전체 진행률 */}
        <Card>
          <CardHeader>
            <CardTitle>전체 개발 진행률</CardTitle>
            <CardDescription>완료된 기능 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={completionRate} className="h-3" />
              <p className="text-sm text-muted-foreground text-right">
                {completionRate.toFixed(1)}% 완료
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 카테고리 필터 */}
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
            >
              {category === "all" ? "전체" : category}
            </Button>
          ))}
        </div>

        {/* 기능 목록 */}
        <div className="grid gap-4">
          {filteredFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.id} className={feature.status === "done" ? "border-green-500" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${feature.status === "done" ? "bg-green-100 dark:bg-green-950" : "bg-primary/10"}`}>
                        <Icon className={`h-5 w-5 ${feature.status === "done" ? "text-green-600" : "text-primary"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle>{feature.name}</CardTitle>
                          {feature.status === "done" && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                          {feature.status === "blocked" && (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className={statusColors[feature.status]}>
                        {statusLabels[feature.status]}
                      </Badge>
                      <Badge variant="outline" className={difficultyColors[feature.difficulty]}>
                        {difficultyLabels[feature.difficulty]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">상세 기능</h4>
                      <ul className="space-y-1">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-semibold">카테고리:</span>
                        <Badge variant="secondary" className="ml-2">{feature.category}</Badge>
                      </div>
                      <div>
                        <span className="text-sm font-semibold">우선순위:</span>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 ${
                            feature.priority === "high" ? "border-red-500 text-red-600" :
                            feature.priority === "medium" ? "border-yellow-500 text-yellow-600" :
                            "border-gray-500 text-gray-600"
                          }`}
                        >
                          {feature.priority === "high" ? "높음" : feature.priority === "medium" ? "중간" : "낮음"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">예상 개발 기간: {feature.estimatedDays}일</span>
                      </div>
                      {feature.dependencies && (
                        <div className="text-sm text-orange-600 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 mt-0.5" />
                          <span>의존성: {feature.dependencies.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {feature.status === "in-progress" && (
                    <Button className="w-full gap-2">
                      <Sparkles className="h-4 w-4" />
                      개발 진행중
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 개발 로드맵 요약 */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>개발 로드맵 요약</CardTitle>
            <CardDescription>우선순위 기반 개발 계획</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-bold text-blue-600 mb-2">🔵 Phase 1: 현재 개발중 (1주)</h4>
              <ul className="space-y-1 text-sm">
                <li>• 훈련일지 작성 시스템 (2일)</li>
                <li>• 만족도 조사 시스템 (3일)</li>
                <li>• 상담일지 관리 (2일)</li>
                <li>• 중도탈락 관리 (3일)</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold text-green-600 mb-2">🟢 Phase 2: 다음 단계 (2주)</h4>
              <ul className="space-y-1 text-sm">
                <li>• 출결 상세 관리 강화 (3일)</li>
                <li>• 수료 요건 자동 체크 (2일)</li>
                <li>• 훈련수당 계산 시스템 (3일)</li>
                <li>• 훈련 진행 리포트 생성 (4일)</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-bold text-orange-600 mb-2">🟠 Phase 3: 고급 기능 (1-2개월)</h4>
              <ul className="space-y-1 text-sm">
                <li>• 전자서명 시스템 (10일)</li>
                <li>• HRD-Net API 연동 준비</li>
              </ul>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-bold text-red-600 mb-2">🔴 Phase 4: 장기 계획 (3개월+)</h4>
              <ul className="space-y-1 text-sm">
                <li>• HRD-Net API 연동 (정부 승인 필요)</li>
                <li>• 고용보험 시스템 연동 (법적 검토 필요)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* HRD 기능 노출 관리 탭 */}
          <TabsContent value="visibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  HRD 기능 노출 설정
                </CardTitle>
                <CardDescription>
                  각 역할별 HRD 기능의 메뉴 노출 여부를 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 학생 기능 */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        학생 메뉴
                      </h3>
                      <div className="grid gap-3">
                        {hrdFeatures
                          .filter((f: any) => f.role === "student")
                          .map((feature: any) => (
                            <div
                              key={feature.id}
                              className="flex items-center justify-between p-4 rounded-lg border bg-card"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{feature.feature_name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {feature.feature_key}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {feature.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 ml-4">
                                <Switch
                                  checked={feature.is_enabled}
                                  onCheckedChange={(checked) =>
                                    toggleFeature.mutate({ id: feature.id, enabled: checked })
                                  }
                                />
                                {feature.is_enabled ? (
                                  <Eye className="h-4 w-4 text-green-600" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* 강사 기능 */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-accent" />
                        강사 메뉴
                      </h3>
                      <div className="grid gap-3">
                        {hrdFeatures
                          .filter((f: any) => f.role === "teacher")
                          .map((feature: any) => (
                            <div
                              key={feature.id}
                              className="flex items-center justify-between p-4 rounded-lg border bg-card"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{feature.feature_name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {feature.feature_key}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {feature.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 ml-4">
                                <Switch
                                  checked={feature.is_enabled}
                                  onCheckedChange={(checked) =>
                                    toggleFeature.mutate({ id: feature.id, enabled: checked })
                                  }
                                />
                                {feature.is_enabled ? (
                                  <Eye className="h-4 w-4 text-green-600" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* 관리자 기능 */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-secondary" />
                        관리자 메뉴
                      </h3>
                      <div className="grid gap-3">
                        {hrdFeatures
                          .filter((f: any) => f.role === "admin")
                          .map((feature: any) => (
                            <div
                              key={feature.id}
                              className="flex items-center justify-between p-4 rounded-lg border bg-card"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{feature.feature_name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {feature.feature_key}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {feature.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 ml-4">
                                <Switch
                                  checked={feature.is_enabled}
                                  onCheckedChange={(checked) =>
                                    toggleFeature.mutate({ id: feature.id, enabled: checked })
                                  }
                                />
                                {feature.is_enabled ? (
                                  <Eye className="h-4 w-4 text-green-600" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OperatorLayout>
  );
};

export default OperatorGovernmentTraining;
