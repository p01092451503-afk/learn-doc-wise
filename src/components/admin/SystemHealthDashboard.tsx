import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Wrench
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FeatureCheck {
  feature: string;
  category: string;
  status: 'operational' | 'warning' | 'error' | 'incomplete' | 'enhancement_needed';
  message: string;
  details?: any;
}

interface HealthCheckResult {
  checkId: string;
  overallStatus: 'healthy' | 'degraded' | 'critical';
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  checks: FeatureCheck[];
  aiAnalysis: string;
  recommendations: string[];
  executionTime: number;
}

export const SystemHealthDashboard = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const { toast } = useToast();

  const runHealthCheck = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-health-check');
      
      if (error) throw error;

      setResult(data);
      
      toast({
        title: "헬스 체크 완료",
        description: `${data.totalChecks}개 항목 검사 완료 (${(data.executionTime / 1000).toFixed(2)}초)`,
      });
    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "헬스 체크 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'incomplete':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'enhancement_needed':
        return <Wrench className="h-5 w-5 text-blue-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      operational: "default",
      warning: "secondary",
      error: "destructive",
      incomplete: "outline",
      enhancement_needed: "outline",
    };
    
    const labels: Record<string, string> = {
      operational: "정상",
      warning: "경고",
      error: "오류",
      incomplete: "미개발",
      enhancement_needed: "개선필요",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Role')) {
      return '👤';
    }
    return null;
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const healthPercentage = result 
    ? Math.round((result.passedChecks / result.totalChecks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">시스템 헬스 체크</h2>
          <p className="text-muted-foreground mt-1">
            전체 시스템의 상태를 AI로 자동 진단하고 개선 방안을 제시합니다
          </p>
        </div>
        <Button
          onClick={runHealthCheck}
          disabled={isChecking}
          size="lg"
          className="gap-2"
        >
          {isChecking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              검사 중...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              헬스 체크 실행
            </>
          )}
        </Button>
      </div>

      {result && (
        <>
          {/* 전체 상태 카드 */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">전체 시스템 상태</h3>
                  <p className="text-sm text-muted-foreground">
                    마지막 체크: {new Date().toLocaleString('ko-KR')}
                  </p>
                </div>
                <div className={`text-4xl font-bold ${getOverallStatusColor(result.overallStatus)}`}>
                  {result.overallStatus === 'healthy' && '✓ 정상'}
                  {result.overallStatus === 'degraded' && '⚠ 주의'}
                  {result.overallStatus === 'critical' && '✗ 위험'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>시스템 건강도</span>
                  <span className="font-semibold">{healthPercentage}%</span>
                </div>
                <Progress value={healthPercentage} className="h-3" />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-secondary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{result.totalChecks}</div>
                  <div className="text-xs text-muted-foreground">총 체크</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.passedChecks}</div>
                  <div className="text-xs text-muted-foreground">정상</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{result.warningChecks}</div>
                  <div className="text-xs text-muted-foreground">경고</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{result.failedChecks}</div>
                  <div className="text-xs text-muted-foreground">오류</div>
                </div>
              </div>
            </div>
          </Card>

          {/* AI 분석 */}
          {result.aiAnalysis && (
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-3">AI 분석 리포트</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-sm">{result.aiAnalysis}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 개선 권장사항 */}
          {result.recommendations && result.recommendations.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">우선순위별 개선 권장사항</h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-secondary/5 rounded-lg">
                    <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                    <p className="text-sm flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 기능별 상태 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">기능별 상세 상태</h3>
            <div className="space-y-3">
              {result.checks.map((check, index) => (
                <div
                  key={index}
                  className="border rounded-lg hover:bg-secondary/5 transition-colors"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 flex-1">
                      {getCategoryIcon(check.category) && (
                        <span className="text-2xl">{getCategoryIcon(check.category)}</span>
                      )}
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium">{check.feature}</div>
                        <div className="text-sm text-muted-foreground">{check.message}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {check.category}
                      </Badge>
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                  
                  {/* 역할별 상세 테스트 결과 */}
                  {check.details?.tests && check.details.tests.length > 0 && (
                    <div className="px-4 pb-4 pt-2 border-t bg-secondary/5">
                      <div className="text-sm font-medium mb-2">세부 테스트 항목:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {check.details.tests.map((test: any, testIndex: number) => (
                          <div
                            key={testIndex}
                            className="flex items-center gap-2 text-sm p-2 rounded bg-background"
                          >
                            {test.passed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className={test.passed ? '' : 'text-red-600'}>
                              {test.test}
                            </span>
                          </div>
                        ))}
                      </div>
                      {!check.details.hasTestAccount && (
                        <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          테스트 계정이 없어 실제 기능 테스트를 수행하지 못했습니다
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* 실행 정보 */}
          <div className="text-sm text-muted-foreground text-center">
            검사 완료 시간: {(result.executionTime / 1000).toFixed(2)}초 | 
            검사 ID: {result.checkId.slice(0, 8)}
          </div>
        </>
      )}

      {!result && !isChecking && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Activity className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">헬스 체크를 시작하세요</h3>
              <p className="text-sm text-muted-foreground mt-2">
                시스템의 전체 상태를 자동으로 진단하고 AI 분석 리포트를 받아보세요
              </p>
            </div>
            <Button onClick={runHealthCheck} size="lg" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              첫 헬스 체크 실행
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};