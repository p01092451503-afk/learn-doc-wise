import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Key, 
  CheckCircle, 
  Calendar,
  Users,
  Shield,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const OperatorLicense = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const licenseInfo = {
    key: "ATOM-LMS-2024-XXXX-XXXX-XXXX",
    status: "활성",
    type: "Enterprise",
    maxUsers: 1000,
    currentUsers: 342,
    startDate: "2024-01-01",
    expiryDate: "2025-12-31",
    daysRemaining: 425
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(licenseInfo.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "복사 완료",
      description: "라이선스 키가 클립보드에 복사되었습니다.",
    });
  };

  const handleRenew = () => {
    toast({
      title: "갱신 요청",
      description: "라이선스 갱신 요청이 전송되었습니다.",
    });
  };

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Key className="h-8 w-8 text-primary" />
              라이선스 관리
              <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-400 border-blue-500/50">
                온프레미스
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-2">시스템 라이선스 정보 및 관리</p>
          </div>
        </div>

        {/* License Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">라이선스 상태</p>
                  <p className="text-2xl font-bold text-foreground">활성</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">사용자 수</p>
                  <p className="text-2xl font-bold text-foreground">{licenseInfo.currentUsers}/{licenseInfo.maxUsers}</p>
                </div>
                <Users className="h-10 w-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">남은 기간</p>
                  <p className="text-2xl font-bold text-foreground">{licenseInfo.daysRemaining}일</p>
                </div>
                <Calendar className="h-10 w-10 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">라이선스 타입</p>
                  <p className="text-2xl font-bold text-foreground">{licenseInfo.type}</p>
                </div>
                <Shield className="h-10 w-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* License Details */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-400" />
              라이선스 상세 정보
            </CardTitle>
            <CardDescription>현재 등록된 라이선스 정보</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground">라이선스 키</Label>
                <div className="flex gap-2">
                  <Input 
                    value={licenseInfo.key}
                    readOnly
                    className="bg-muted/50 border-border text-foreground font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyKey}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">라이선스 타입</Label>
                <Input 
                  value={licenseInfo.type}
                  readOnly
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">시작일</Label>
                <Input 
                  value={licenseInfo.startDate}
                  readOnly
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">만료일</Label>
                <Input 
                  value={licenseInfo.expiryDate}
                  readOnly
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">최대 사용자 수</Label>
                <Input 
                  value={licenseInfo.maxUsers}
                  readOnly
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">현재 사용자 수</Label>
                <Input 
                  value={licenseInfo.currentUsers}
                  readOnly
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleRenew}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                라이선스 갱신
              </Button>
              <Button 
                variant="outline"
              >
                라이선스 변경
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* License Features */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              포함된 기능
            </CardTitle>
            <CardDescription>현재 라이선스에서 사용 가능한 기능</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "무제한 강좌 개설",
                "AI 기능 전체 사용",
                "최대 1,000명 사용자",
                "24/7 기술 지원",
                "자동 백업",
                "고급 분석 도구",
                "커스텀 브랜딩",
                "API 접근 권한"
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expiry Warning */}
        {licenseInfo.daysRemaining < 90 && (
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-orange-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">라이선스 만료 예정</h3>
                  <p className="text-foreground/80 mb-4">
                    라이선스가 {licenseInfo.daysRemaining}일 후 만료됩니다. 
                    서비스 중단을 방지하기 위해 지금 갱신하세요.
                  </p>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    지금 갱신하기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* New License Activation */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Key className="h-5 w-5 text-purple-400" />
              새 라이선스 등록
            </CardTitle>
            <CardDescription>새로운 라이선스 키를 입력하여 등록</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">라이선스 키</Label>
              <Input 
                placeholder="ATOM-LMS-XXXX-XXXX-XXXX"
                className="bg-muted/50 border-border text-foreground font-mono"
              />
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              라이선스 활성화
            </Button>
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorLicense;
