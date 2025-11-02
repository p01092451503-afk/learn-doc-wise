import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  RefreshCw,
  Shield,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OperatorUpdates = () => {
  const { toast } = useToast();

  const currentVersion = "2.5.3";
  const latestVersion = "2.6.0";

  const updateHistory = [
    {
      version: "2.5.3",
      date: "2025-10-15",
      type: "패치",
      status: "현재 버전"
    },
    {
      version: "2.5.2",
      date: "2025-10-01",
      type: "버그 수정",
      status: "완료"
    },
    {
      version: "2.5.0",
      date: "2025-09-15",
      type: "메이저",
      status: "완료"
    },
  ];

  const handleUpdate = () => {
    toast({
      title: "업데이트 시작",
      description: "시스템 업데이트를 시작합니다. 잠시만 기다려주세요.",
    });
  };

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
              <Package className="h-8 w-8 text-primary" />
              업데이트 관리
              <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-400 border-blue-500/50">
                온프레미스
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-2">시스템 버전 및 업데이트 관리</p>
          </div>
        </div>

        {/* Current Version Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">현재 버전</p>
                  <p className="text-3xl font-bold text-foreground">{currentVersion}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">최신 버전</p>
                  <p className="text-3xl font-bold text-foreground">{latestVersion}</p>
                </div>
                <Zap className="h-10 w-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">업데이트 상태</p>
                  <p className="text-lg font-bold text-foreground">업데이트 가능</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Update */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Download className="h-5 w-5 text-green-400" />
              사용 가능한 업데이트
            </CardTitle>
            <CardDescription>새로운 버전이 출시되었습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-6 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">버전 2.6.0</h3>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                      권장 업데이트
                    </Badge>
                  </div>
                  <Button onClick={handleUpdate} className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    지금 업데이트
                  </Button>
                </div>
                
                <div className="space-y-3 text-foreground/80">
                  <div>
                    <p className="font-semibold text-foreground mb-2">새로운 기능:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>향상된 백업 시스템</li>
                      <li>실시간 모니터링 대시보드</li>
                      <li>자동 장애 복구 기능</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-foreground mb-2">개선사항:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>시스템 성능 최적화 (30% 향상)</li>
                      <li>보안 패치 적용</li>
                      <li>사용자 인터페이스 개선</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-foreground mb-2">버그 수정:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>데이터베이스 연결 안정성 개선</li>
                      <li>파일 업로드 오류 수정</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Update Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-400" />
                자동 업데이트 설정
              </CardTitle>
              <CardDescription>업데이트 자동화 옵션</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <span className="text-foreground">보안 패치 자동 설치</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                  활성
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <span className="text-foreground">메이저 업데이트 알림</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                  활성
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <span className="text-foreground">업데이트 전 백업</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                  활성
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" />
                롤백 옵션
              </CardTitle>
              <CardDescription>이전 버전으로 복구</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                업데이트 후 문제가 발생하면 이전 버전으로 롤백할 수 있습니다.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
              >
                이전 버전으로 복구
              </Button>
              <p className="text-xs text-muted-foreground/60 text-center">
                마지막 안정 버전: 2.5.2
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Update History */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5" />
              업데이트 기록
            </CardTitle>
            <CardDescription>최근 업데이트 내역</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {updateHistory.map((update, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Package className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">버전 {update.version}</p>
                      <p className="text-sm text-muted-foreground">{update.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-border text-foreground/70">
                      {update.type}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={
                        update.status === "현재 버전"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/50"
                          : "bg-green-500/10 text-green-400 border-green-500/50"
                      }
                    >
                      {update.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorUpdates;
