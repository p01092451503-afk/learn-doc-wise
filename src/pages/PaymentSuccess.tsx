import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AtomSpinner } from "@/components/AtomSpinner";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(true);
  const [creating, setCreating] = useState(false);

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
        // Step 1: Confirm payment
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
          "toss-payment-confirm",
          {
            body: {
              paymentKey,
              orderId,
              amount: parseInt(amount),
            },
          }
        );

        if (paymentError) throw paymentError;

        console.log("Payment confirmed:", paymentData);
        setConfirming(false);

        // Step 2: Create tenant automatically
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("User not found");
        }

        // Get metadata from payment
        const metadata = paymentData?.metadata;
        
        if (!metadata || !metadata.organizationName || !metadata.subdomain || !metadata.plan) {
          toast({
            title: "결제 완료",
            description: "결제가 완료되었으나 테넌트 정보가 없습니다. 관리자에게 문의해주세요.",
          });
          return;
        }

        setCreating(true);

        // Create tenant
        const { data: tenantData, error: tenantError } = await supabase.functions.invoke(
          "create-tenant-after-payment",
          {
            body: {
              user_id: user.id,
              plan: metadata.plan,
              organizationName: metadata.organizationName,
              subdomain: metadata.subdomain,
              description: metadata.description || "",
              payment_id: paymentData.payment_id,
            },
          }
        );

        if (tenantError) {
          console.error("Tenant creation error:", tenantError);
          toast({
            title: "테넌트 생성 오류",
            description: "결제는 완료되었으나 테넌트 생성 중 오류가 발생했습니다. 고객센터로 문의해주세요.",
            variant: "destructive",
          });
          return;
        }

        console.log("Tenant created:", tenantData);

        toast({
          title: "환영합니다! 🎉",
          description: `${metadata.organizationName} LMS가 성공적으로 생성되었습니다!`,
        });

        // Redirect to tenant home after 2 seconds
        setTimeout(() => {
          window.location.href = `https://${metadata.subdomain}.atomlms.com`;
        }, 2000);

      } catch (error: any) {
        console.error("Payment/Tenant creation error:", error);
        toast({
          title: "오류",
          description: error.message || "처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setCreating(false);
      }
    };

    confirmPayment();
  }, [searchParams, toast, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {confirming || creating ? (
              <AtomSpinner size="lg" />
            ) : (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {confirming ? "결제 승인 중..." : creating ? "LMS 생성 중..." : "설정 완료!"}
          </CardTitle>
          <CardDescription>
            {confirming
              ? "결제를 승인하고 있습니다. 잠시만 기다려주세요."
              : creating
              ? "귀하의 LMS를 생성하고 있습니다. 잠시만 기다려주세요."
              : "모든 설정이 완료되었습니다. 곧 LMS로 이동합니다."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!confirming && !creating && (
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
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
