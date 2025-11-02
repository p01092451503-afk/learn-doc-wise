import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, MessageSquare, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const StudentSatisfactionSurvey = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 참여 가능한 만족도 조사 목록 조회
  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ["available-surveys"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 먼저 내가 수강 중인 강의 목록을 가져옴
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user?.id);

      const courseIds = enrollments?.map(e => e.course_id) || [];
      
      if (courseIds.length === 0) {
        return [];
      }

      // 내가 수강 중인 강의의 활성 만족도 조사
      const { data, error } = await supabase
        .from("satisfaction_surveys")
        .select(`
          *,
          courses (title),
          satisfaction_responses!left (id, user_id)
        `)
        .eq("is_active", true)
        .in("course_id", courseIds);

      if (error) throw error;
      return data || [];
    },
  });

  // 만족도 조사 제출
  const submitSurvey = useMutation({
    mutationFn: async ({ surveyId, responses }: { surveyId: string; responses: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("satisfaction_responses")
        .insert({
          survey_id: surveyId,
          user_id: user?.id,
          responses: responses,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-surveys"] });
      setSelectedSurvey(null);
      toast({
        title: "제출 완료",
        description: "만족도 조사가 제출되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "제출 실패",
        description: "만족도 조사 제출 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, survey: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const responses: any = {};

    survey.questions.forEach((q: any, index: number) => {
      responses[`q${index}`] = formData.get(`q${index}`);
    });

    submitSurvey.mutate({ surveyId: survey.id, responses });
  };

  const isCompleted = (survey: any) => {
    return survey.satisfaction_responses?.some((r: any) => r.user_id);
  };

  const filteredSurveys = surveys.filter((survey: any) =>
    survey.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-violet-500" />
            만족도 조사
          </h1>
          <p className="text-muted-foreground mt-2">
            진행 중인 만족도 조사에 참여하세요
          </p>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="강의, 과제 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 만족도 조사 목록 */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                로딩 중...
              </CardContent>
            </Card>
          ) : filteredSurveys.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {searchTerm ? "검색 결과가 없습니다." : "참여 가능한 만족도 조사가 없습니다."}
              </CardContent>
            </Card>
          ) : (
            filteredSurveys.map((survey: any) => {
              const completed = isCompleted(survey);
              const isExpanded = selectedSurvey === survey.id;

              return (
                <Card key={survey.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="mb-2">{survey.title}</CardTitle>
                        <CardDescription className="text-xl font-semibold text-foreground">
                          {survey.courses?.title}
                        </CardDescription>
                      </div>
                      <Badge variant={completed ? "secondary" : "default"} className="flex-shrink-0">
                    {completed ? (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3" />
                        완료
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        대기중
                      </span>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {survey.description && (
                  <p className="text-sm text-muted-foreground">{survey.description}</p>
                )}
                <div className="text-sm text-muted-foreground px-3 py-2 bg-muted/20 rounded-lg">
                  📅 조사 기간: {new Date(survey.start_date).toLocaleDateString('ko-KR')} ~ {new Date(survey.end_date).toLocaleDateString('ko-KR')}
                </div>

                    {!completed && !isExpanded && (
                      <Button onClick={() => setSelectedSurvey(survey.id)}>
                        참여하기
                      </Button>
                    )}

                    {!completed && isExpanded && (
                      <form onSubmit={(e) => handleSubmit(e, survey)} className="space-y-6 pt-4 border-t">
                        {survey.questions?.map((question: any, index: number) => (
                          <div key={index} className="space-y-3 p-4 bg-muted/30 rounded-lg">
                            <Label className="text-base font-semibold">
                              {index + 1}. {question.question}
                            </Label>
                            {question.type === "rating" ? (
                              <RadioGroup name={`q${index}`} required className="space-y-2">
                                {[1, 2, 3, 4].map((value) => (
                                  <div key={value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-background transition-colors">
                                    <RadioGroupItem value={value.toString()} id={`q${index}-${value}`} className="h-5 w-5" />
                                    <Label htmlFor={`q${index}-${value}`} className="font-normal cursor-pointer flex-1">
                                      {value}점 {value === 1 ? "(매우 불만족)" : value === 2 ? "" : value === 3 ? "" : value === 4 ? "(매우 만족)" : ""}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            ) : (
                              <Textarea
                                name={`q${index}`}
                                placeholder="답변을 입력하세요"
                                rows={4}
                                required
                                className="resize-none"
                              />
                            )}
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Button type="submit" disabled={submitSurvey.isPending}>
                            제출하기
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedSurvey(null)}
                          >
                            취소
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentSatisfactionSurvey;
