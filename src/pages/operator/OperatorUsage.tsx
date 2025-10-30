import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OperatorUsage = () => {
  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">사용량 관리</h1>
          <p className="text-slate-400">전체 고객사의 리소스 사용량을 모니터링합니다</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">사용량 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">개발 중...</p>
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorUsage;
