import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OperatorMonitoring = () => {
  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">시스템 모니터링</h1>
          <p className="text-slate-400">플랫폼 전체의 시스템 상태를 모니터링합니다</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">시스템 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">개발 중...</p>
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorMonitoring;
