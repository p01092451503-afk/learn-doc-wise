import { useState } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calendar,
  HardDrive,
  Server
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OperatorBackup = () => {
  const { toast } = useToast();
  const [isBackingUp, setIsBackingUp] = useState(false);

  const backupHistory = [
    {
      id: 1,
      type: "자동 백업",
      date: "2025-11-02 03:00:00",
      size: "2.4 GB",
      status: "완료",
      duration: "5분 23초"
    },
    {
      id: 2,
      type: "수동 백업",
      date: "2025-11-01 15:30:00",
      size: "2.3 GB",
      status: "완료",
      duration: "4분 58초"
    },
    {
      id: 3,
      type: "자동 백업",
      date: "2025-11-01 03:00:00",
      size: "2.3 GB",
      status: "완료",
      duration: "5분 12초"
    },
  ];

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      toast({
        title: "백업 완료",
        description: "데이터베이스가 성공적으로 백업되었습니다.",
      });
    }, 3000);
  };

  const handleRestore = () => {
    toast({
      title: "복원 시작",
      description: "백업 데이터를 복원하고 있습니다.",
    });
  };

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Database className="h-8 w-8" />
              백업/복원 관리
              <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-400 border-blue-500/50">
                온프레미스
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-2">데이터베이스 및 파일 백업 관리</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Download className="h-5 w-5 text-green-400" />
                수동 백업
              </CardTitle>
              <CardDescription>즉시 백업 생성</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleBackup} 
                disabled={isBackingUp}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isBackingUp ? "백업 중..." : "백업 시작"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Upload className="h-5 w-5 text-orange-400" />
                데이터 복원
              </CardTitle>
              <CardDescription>백업에서 복원</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleRestore}
                variant="outline"
                className="w-full"
              >
                복원하기
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                자동 백업 설정
              </CardTitle>
              <CardDescription>스케줄 관리</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full"
              >
                설정 변경
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Backup Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">전체 백업</p>
                  <p className="text-2xl font-bold text-foreground">24개</p>
                </div>
                <Database className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">성공률</p>
                  <p className="text-2xl font-bold text-foreground">100%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">사용 공간</p>
                  <p className="text-2xl font-bold text-foreground">56 GB</p>
                </div>
                <HardDrive className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">다음 백업</p>
                  <p className="text-2xl font-bold text-foreground">2시간</p>
                </div>
                <Clock className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Backup History */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">백업 기록</CardTitle>
            <CardDescription>최근 백업 내역</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">유형</TableHead>
                  <TableHead className="text-muted-foreground">날짜/시간</TableHead>
                  <TableHead className="text-muted-foreground">크기</TableHead>
                  <TableHead className="text-muted-foreground">소요시간</TableHead>
                  <TableHead className="text-muted-foreground">상태</TableHead>
                  <TableHead className="text-muted-foreground">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backupHistory.map((backup) => (
                  <TableRow key={backup.id} className="border-border hover:bg-muted/30">
                    <TableCell className="text-foreground">{backup.type}</TableCell>
                    <TableCell className="text-foreground/80">{backup.date}</TableCell>
                    <TableCell className="text-foreground/80">{backup.size}</TableCell>
                    <TableCell className="text-foreground/80">{backup.duration}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                        {backup.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          다운로드
                        </Button>
                        <Button size="sm" variant="outline">
                          <Upload className="h-3 w-3 mr-1" />
                          복원
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Backup Schedule */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              자동 백업 스케줄
            </CardTitle>
            <CardDescription>예약된 백업 일정</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-foreground font-medium">데이터베이스 전체 백업</p>
                    <p className="text-sm text-muted-foreground">매일 오전 3:00</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                  활성
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-foreground font-medium">파일 스토리지 백업</p>
                    <p className="text-sm text-muted-foreground">매주 일요일 오전 2:00</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                  활성
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorBackup;
