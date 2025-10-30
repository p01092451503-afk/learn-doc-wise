import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(true);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      if (!paymentKey || !orderId || !amount) {
        toast({
          title: "오류",
          description: "결제 정보가 올바르지 않습니다.",
          variant: "destructive",
        });
        setConfirming(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("toss-payment-confirm", {
          body: {
            paymentKey,
            orderId,
            amount: parseInt(amount),
          },
        });

        if (error) throw error;

        toast({
          title: "결제 성공",
          description: "결제가 성공적으로 완료되었습니다.",
        });
      } catch (error: any) {
        console.error("Payment confirmation error:", error);
        toast({
          title: "결제 승인 오류",
          description: error.message || "결제 승인 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setConfirming(false);
      }
    };

    confirmPayment();
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {confirming ? (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            ) : (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {confirming ? "결제 승인 중..." : "결제 완료"}
          </CardTitle>
          <CardDescription>
            {confirming
              ? "결제를 승인하고 있습니다. 잠시만 기다려주세요."
              : "결제가 성공적으로 완료되었습니다."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!confirming && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">주문번호</span>
                <span className="font-medium">{searchParams.get("orderId")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">결제금액</span>
                <span className="font-medium">
                  ₩{parseInt(searchParams.get("amount") || "0").toLocaleString()}
                </span>
              </div>
            </div>
          )}
          
          {!confirming && (
            <div className="flex gap-2">
              <Button
                onClick={() => navigate("/admin/tenants")}
                className="flex-1"
              >
                고객사 관리로 이동
              </Button>
              <Button
                onClick={() => navigate("/admin/usage")}
                variant="outline"
                className="flex-1"
              >
                사용량 관리로 이동
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
