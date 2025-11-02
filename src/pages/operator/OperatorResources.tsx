import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Activity,
  MemoryStick,
  Network,
  Gauge,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

const OperatorResources = () => {
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memoryUsage, setMemoryUsage] = useState(62);
  const [diskUsage, setDiskUsage] = useState(38);
  const [networkIn, setNetworkIn] = useState(2.4);
  const [networkOut, setNetworkOut] = useState(1.8);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 5)));
      setNetworkIn(prev => Math.max(0, prev + (Math.random() - 0.5) * 0.5));
      setNetworkOut(prev => Math.max(0, prev + (Math.random() - 0.5) * 0.3));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getUsageColor = (usage: number) => {
    if (usage < 50) return "text-green-400";
    if (usage < 80) return "text-yellow-400";
    return "text-red-400";
  };

  const getUsageBgColor = (usage: number) => {
    if (usage < 50) return "bg-green-500";
    if (usage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Server className="h-8 w-8 text-primary" />
              서버 리소스 모니터링
              <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-400 border-blue-500/50">
                온프레미스
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-2">실시간 서버 자원 사용 현황</p>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">CPU 사용률</p>
                  <p className={`text-3xl font-bold ${getUsageColor(cpuUsage)}`}>
                    {cpuUsage.toFixed(1)}%
                  </p>
                </div>
                <Cpu className="h-10 w-10 text-blue-400" />
              </div>
              <Progress value={cpuUsage} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">메모리 사용률</p>
                  <p className={`text-3xl font-bold ${getUsageColor(memoryUsage)}`}>
                    {memoryUsage.toFixed(1)}%
                  </p>
                </div>
                <MemoryStick className="h-10 w-10 text-purple-400" />
              </div>
              <Progress value={memoryUsage} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">디스크 사용률</p>
                  <p className={`text-3xl font-bold ${getUsageColor(diskUsage)}`}>
                    {diskUsage}%
                  </p>
                </div>
                <HardDrive className="h-10 w-10 text-green-400" />
              </div>
              <Progress value={diskUsage} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">네트워크</p>
                  <p className="text-xl font-bold text-foreground">
                    ↓{networkIn.toFixed(1)} MB/s
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    ↑{networkOut.toFixed(1)} MB/s
                  </p>
                </div>
                <Network className="h-10 w-10 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Resource Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CPU Details */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-400" />
                CPU 상세 정보
              </CardTitle>
              <CardDescription>프로세서 사용 현황</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">모델</span>
                  <span className="text-foreground font-medium">Intel Xeon E5-2680 v4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">코어 수</span>
                  <span className="text-foreground font-medium">16 코어 / 32 스레드</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">클럭 속도</span>
                  <span className="text-foreground font-medium">2.4 GHz</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">온도</span>
                  <span className="text-green-400 font-medium">58°C</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">코어별 사용률</p>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(16)].map((_, i) => {
                    const usage = Math.floor(Math.random() * 100);
                    return (
                      <div key={i} className="text-center">
                        <div className="h-16 bg-muted/50 rounded-lg relative overflow-hidden">
                          <div 
                            className={`absolute bottom-0 w-full ${getUsageBgColor(usage)} transition-all`}
                            style={{ height: `${usage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{usage}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Details */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <MemoryStick className="h-5 w-5 text-purple-400" />
                메모리 상세 정보
              </CardTitle>
              <CardDescription>RAM 사용 현황</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">총 메모리</span>
                  <span className="text-foreground font-medium">64 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">사용 중</span>
                  <span className="text-foreground font-medium">39.7 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">사용 가능</span>
                  <span className="text-green-400 font-medium">24.3 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">캐시</span>
                  <span className="text-blue-400 font-medium">12.8 GB</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">메모리 사용 분포</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">시스템</span>
                      <span className="text-sm text-foreground">8.2 GB</span>
                    </div>
                    <Progress value={13} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">애플리케이션</span>
                      <span className="text-sm text-foreground">25.6 GB</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">데이터베이스</span>
                      <span className="text-sm text-foreground">5.9 GB</span>
                    </div>
                    <Progress value={9} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disk and Network */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Disk Details */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-green-400" />
                디스크 상세 정보
              </CardTitle>
              <CardDescription>저장소 사용 현황</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">총 용량</span>
                  <span className="text-foreground font-medium">2 TB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">사용 중</span>
                  <span className="text-foreground font-medium">760 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">사용 가능</span>
                  <span className="text-green-400 font-medium">1.24 TB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">디스크 타입</span>
                  <span className="text-foreground font-medium">SSD NVMe</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">파티션별 사용량</p>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-foreground font-medium">/</span>
                      <span className="text-sm text-muted-foreground">350 GB / 500 GB</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-foreground font-medium">/data</span>
                      <span className="text-sm text-muted-foreground">410 GB / 1.5 TB</span>
                    </div>
                    <Progress value={27} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Details */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Network className="h-5 w-5 text-orange-400" />
                네트워크 상세 정보
              </CardTitle>
              <CardDescription>네트워크 트래픽 현황</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">수신 속도</span>
                  <span className="text-green-400 font-medium">{networkIn.toFixed(2)} MB/s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">송신 속도</span>
                  <span className="text-blue-400 font-medium">{networkOut.toFixed(2)} MB/s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">총 수신량 (24시간)</span>
                  <span className="text-foreground font-medium">156.3 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">총 송신량 (24시간)</span>
                  <span className="text-foreground font-medium">89.7 GB</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">활성 연결</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm text-muted-foreground">HTTP/HTTPS</span>
                    <span className="text-sm text-foreground">342 연결</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm text-muted-foreground">데이터베이스</span>
                    <span className="text-sm text-foreground">28 연결</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm text-muted-foreground">WebSocket</span>
                    <span className="text-sm text-foreground">156 연결</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Alerts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-yellow-400" />
              시스템 알림
            </CardTitle>
            <CardDescription>리소스 사용 경고</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">메모리 사용률 높음</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    메모리 사용률이 {memoryUsage.toFixed(1)}%입니다. 성능 저하가 발생할 수 있습니다.
                  </p>
                </div>
              </div>

              {diskUsage > 80 && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-foreground font-medium">디스크 공간 부족</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      디스크 사용률이 {diskUsage}%입니다. 공간 확보가 필요합니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorResources;
