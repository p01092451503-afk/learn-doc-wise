import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OperatorSettings = () => {
  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">플랫폼 설정</h1>
          <p className="text-slate-400">플랫폼 전체 설정을 관리합니다</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">설정</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">개발 중...</p>
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorSettings;
