import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">결제 실패</CardTitle>
          <CardDescription>
            결제 처리 중 오류가 발생했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            {orderId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">주문번호</span>
                <span className="font-medium">{orderId}</span>
              </div>
            )}
            {errorCode && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">오류 코드</span>
                <span className="font-medium text-destructive">{errorCode}</span>
              </div>
            )}
            {errorMessage && (
              <div className="text-sm">
                <span className="text-muted-foreground block mb-1">오류 메시지</span>
                <p className="text-destructive">{decodeURIComponent(errorMessage)}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => navigate("/admin/tenants")}
              className="w-full"
            >
              고객사 관리로 돌아가기
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              다시 시도하기
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            문제가 계속되면 고객 지원팀에 문의해주세요.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFail;
