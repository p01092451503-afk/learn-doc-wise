import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OperatorAILogs = () => {
  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI 로그</h1>
          <p className="text-slate-400">전체 AI 사용 기록을 확인합니다</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">AI 사용 로그</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">개발 중...</p>
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorAILogs;
