import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useRealtimeUsage } from "@/hooks/useRealtimeUsage";
import { UsageLimitAlert } from "./UsageLimitAlert";
import { Users, HardDrive, Zap, Activity } from "lucide-react";
import { AtomLoader } from "@/components/AtomLoader";

interface RealtimeUsageMonitorProps {
  tenantId: string;
}

export const RealtimeUsageMonitor = ({ tenantId }: RealtimeUsageMonitorProps) => {
  const { limits, loading } = useUsageLimits(tenantId);
  const { usage } = useRealtimeUsage(tenantId);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <AtomLoader />
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (percent: number) => {
    if (percent >= 100) return <Badge variant="destructive">초과</Badge>;
    if (percent >= 80) return <Badge variant="default">경고</Badge>;
    if (percent >= 60) return <Badge variant="secondary">주의</Badge>;
    return <Badge variant="outline">정상</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Alert Banners */}
      {limits.isStudentLimitExceeded && (
        <UsageLimitAlert
          type="student"
          current={limits.studentCount}
          max={limits.maxStudents}
          percentage={limits.studentUsagePercent}
          isBlocking={true}
        />
      )}
      {limits.isStorageLimitExceeded && (
        <UsageLimitAlert
          type="storage"
          current={limits.storageUsedGB}
          max={limits.maxStorageGB}
          percentage={limits.storageUsagePercent}
          isBlocking={true}
        />
      )}
      {limits.isAITokenLimitExceeded && (
        <UsageLimitAlert
          type="ai_token"
          current={limits.aiTokensUsed}
          max={limits.maxAITokens}
          percentage={limits.aiTokenUsagePercent}
          isBlocking={true}
        />
      )}

      {/* Warning Alerts */}
      {!limits.isStudentLimitExceeded && limits.studentUsagePercent >= 80 && (
        <UsageLimitAlert
          type="student"
          current={limits.studentCount}
          max={limits.maxStudents}
          percentage={limits.studentUsagePercent}
        />
      )}
      {!limits.isStorageLimitExceeded && limits.storageUsagePercent >= 80 && (
        <UsageLimitAlert
          type="storage"
          current={limits.storageUsedGB}
          max={limits.maxStorageGB}
          percentage={limits.storageUsagePercent}
        />
      )}
      {!limits.isAITokenLimitExceeded && limits.aiTokenUsagePercent >= 80 && (
        <UsageLimitAlert
          type="ai_token"
          current={limits.aiTokensUsed}
          max={limits.maxAITokens}
          percentage={limits.aiTokenUsagePercent}
        />
      )}

      {/* Real-time Usage Cards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                실시간 사용량 모니터링
              </CardTitle>
              <CardDescription className="mt-2">
                마지막 업데이트: {new Date(usage.last_updated).toLocaleString("ko-KR")}
              </CardDescription>
            </div>
            <Badge variant="outline" className="animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              실시간
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">학생 수</span>
              </div>
              {getStatusBadge(limits.studentUsagePercent)}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{limits.studentCount} / {limits.maxStudents}명</span>
              <span>{limits.studentUsagePercent.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(limits.studentUsagePercent, 100)} />
          </div>

          {/* Storage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">스토리지</span>
              </div>
              {getStatusBadge(limits.storageUsagePercent)}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{limits.storageUsedGB.toFixed(2)} / {limits.maxStorageGB} GB</span>
              <span>{limits.storageUsagePercent.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(limits.storageUsagePercent, 100)} />
          </div>

          {/* AI Tokens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">AI 토큰</span>
              </div>
              {getStatusBadge(limits.aiTokenUsagePercent)}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{limits.aiTokensUsed.toLocaleString()} / {limits.maxAITokens.toLocaleString()}</span>
              <span>{limits.aiTokenUsagePercent.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(limits.aiTokenUsagePercent, 100)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
