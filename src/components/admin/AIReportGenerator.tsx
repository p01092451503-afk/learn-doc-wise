import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, FileText, Users, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AIReportGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const { toast } = useToast();

  const generateReport = async (reportType: 'overview' | 'engagement' | 'risk') => {
    setIsGenerating(true);
    setReport(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-report', {
        body: { 
          reportType,
          dateRange: { start: null, end: null }
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes("Rate limits exceeded")) {
          toast({
            title: "요청 한도 초과",
            description: "잠시 후 다시 시도해주세요.",
            variant: "destructive"
          });
        } else if (data.error.includes("Payment required")) {
          toast({
            title: "크레딧 부족",
            description: "Lovable AI 워크스페이스에 크레딧을 추가해주세요.",
            variant: "destructive"
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setReport(data.report);
      setStatistics(data.statistics);
      
      toast({
        title: "리포트 생성 완료",
        description: "AI 분석 리포트가 생성되었습니다."
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "리포트 생성 실패",
        description: "리포트 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI 학습 분석 리포트
            <Badge variant="default" className="text-xs">AI</Badge>
          </CardTitle>
          <CardDescription>
            AI가 학습 데이터를 분석하여 인사이트와 개선 방안을 제공합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              onClick={() => generateReport('overview')}
              disabled={isGenerating}
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:bg-primary/5 relative"
            >
              <Badge variant="default" className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5">AI</Badge>
              <FileText className="h-5 w-5 mb-2 text-primary" />
              <div className="text-left">
                <div className="font-semibold">전체 현황 리포트</div>
                <div className="text-xs text-muted-foreground mt-1">
                  플랫폼 전반의 학습 현황 종합 분석
                </div>
              </div>
            </Button>

            <Button
              onClick={() => generateReport('engagement')}
              disabled={isGenerating}
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:bg-accent/5 relative"
            >
              <Badge variant="default" className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5">AI</Badge>
              <Users className="h-5 w-5 mb-2 text-accent" />
              <div className="text-left">
                <div className="font-semibold">참여도 분석</div>
                <div className="text-xs text-muted-foreground mt-1">
                  학습자 참여도 패턴 및 개선 방안
                </div>
              </div>
            </Button>

            <Button
              onClick={() => generateReport('risk')}
              disabled={isGenerating}
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:bg-destructive/5 relative"
            >
              <Badge variant="default" className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5">AI</Badge>
              <AlertTriangle className="h-5 w-5 mb-2 text-destructive" />
              <div className="text-left">
                <div className="font-semibold">이탈 위험 분석</div>
                <div className="text-xs text-muted-foreground mt-1">
                  이탈 위험 학습자 식별 및 대응 방안
                </div>
              </div>
            </Button>
          </div>

          {isGenerating && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                AI가 리포트를 생성하고 있습니다...
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {statistics && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">주요 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{statistics.totalStudents}</div>
                <div className="text-xs text-muted-foreground mt-1">전체 학습자</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{statistics.avgProgress}%</div>
                <div className="text-xs text-muted-foreground mt-1">평균 진도율</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{statistics.completedCourses}</div>
                <div className="text-xs text-muted-foreground mt-1">완료한 강좌</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{statistics.atRiskStudents}</div>
                <div className="text-xs text-muted-foreground mt-1">이탈 위험</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{statistics.highEngagement}</div>
                <div className="text-xs text-muted-foreground mt-1">높은 참여도</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {report && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">분석 리포트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {report}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};