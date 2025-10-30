import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OperatorRevenue = () => {
  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">매출 관리</h1>
          <p className="text-slate-400">전체 고객사의 매출 현황을 확인합니다</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">매출 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">개발 중...</p>
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorRevenue;
