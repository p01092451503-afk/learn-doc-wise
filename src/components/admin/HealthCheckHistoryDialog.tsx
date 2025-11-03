import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle, Clock, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HealthCheckHistory {
  id: string;
  check_id: string;
  overall_status: string;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  warning_checks: number;
  ai_analysis: string;
  execution_time: number;
  created_at: string;
}

interface HealthCheckHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HealthCheckHistoryDialog = ({ open, onOpenChange }: HealthCheckHistoryDialogProps) => {
  const [history, setHistory] = useState<HealthCheckHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_health_check_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching health check history:', error);
      toast({
        title: "이력 조회 실패",
        description: "헬스 체크 이력을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'healthy': return '정상';
      case 'degraded': return '주의';
      case 'critical': return '위험';
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            직전 헬스 체크 결과
          </DialogTitle>
          <DialogDescription>
            가장 최근에 실행한 헬스 체크 결과입니다
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                불러오는 중...
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                아직 헬스 체크 이력이 없습니다
              </div>
            ) : (
              history.map((check, index) => (
                <Card key={check.id} className="p-5">
                  <div className="space-y-4">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.overall_status)}
                          <div>
                            <div className={`font-semibold ${getStatusColor(check.overall_status)}`}>
                              {getStatusLabel(check.overall_status)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(check.created_at).toLocaleString('ko-KR')}
                            </div>
                          </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {(check.execution_time / 1000).toFixed(2)}초
                      </Badge>
                    </div>

                    <Separator />

                    {/* 통계 */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-secondary/10 rounded">
                        <div className="text-xl font-bold">{check.total_checks}</div>
                        <div className="text-xs text-muted-foreground">총 체크</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-xl font-bold text-green-600">{check.passed_checks}</div>
                        <div className="text-xs text-muted-foreground">정상</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded">
                        <div className="text-xl font-bold text-yellow-600">{check.warning_checks}</div>
                        <div className="text-xs text-muted-foreground">경고</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded">
                        <div className="text-xl font-bold text-red-600">{check.failed_checks}</div>
                        <div className="text-xs text-muted-foreground">오류</div>
                      </div>
                    </div>

                    {/* AI 분석 */}
                    {check.ai_analysis && (
                      <div className="bg-primary/5 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                          <div className="text-sm leading-relaxed space-y-3 flex-1">
                            {check.ai_analysis.split(/\n+/).map((paragraph, idx) => {
                              // 섹션 제목 감지 (1., 2., 3. 등)
                              const isSectionTitle = /^\d+\.\s*[\u3131-\uD79D]/.test(paragraph);
                              // 하위 항목 감지 (-, •, 등)
                              const isSubItem = /^[-•]\s/.test(paragraph);
                              
                              if (!paragraph.trim()) return null;
                              
                              return (
                                <div
                                  key={idx}
                                  className={`
                                    ${isSectionTitle ? 'font-semibold text-primary mt-2' : ''}
                                    ${isSubItem ? 'ml-4 text-muted-foreground' : ''}
                                  `}
                                >
                                  {paragraph}
                                </div>
                              );
                            }).filter(Boolean)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};