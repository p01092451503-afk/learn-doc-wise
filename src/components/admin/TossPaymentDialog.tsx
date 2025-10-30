import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Loader2 } from "lucide-react";
import { loadTossPayments } from "@tosspayments/payment-sdk";

const TOSS_CLIENT_KEY = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq"; // 테스트용 클라이언트 키

interface TossPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName: string;
  amount: number;
}

const TossPaymentDialog = ({ 
  open, 
  onOpenChange, 
  tenantId, 
  tenantName, 
  amount 
}: TossPaymentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!customerEmail || !customerName) {
      toast({
        title: "입력 오류",
        description: "이메일과 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // 주문 ID 생성
      const orderId = `ORDER-${tenantId}-${Date.now()}`;
      const orderName = `${tenantName} - 플랜 구독`;

      // 결제 준비 요청
      const { data: prepareData, error: prepareError } = await supabase.functions.invoke(
        "toss-payment-request",
        {
          body: {
            orderId,
            orderName,
            amount,
            customerEmail,
            customerName,
          },
        }
      );

      if (prepareError) throw prepareError;

      // 토스페이먼츠 SDK 로드
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);

      // 결제창 띄우기
      await tossPayments.requestPayment("카드", {
        amount,
        orderId,
        orderName,
        customerName,
        customerEmail,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });

      onOpenChange(false);

    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "결제 오류",
        description: error.message || "결제 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            토스페이먼츠 결제
          </DialogTitle>
          <DialogDescription>
            {tenantName}의 구독 결제를 진행합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">결제 금액</Label>
            <Input
              id="amount"
              value={`₩${amount.toLocaleString()}`}
              disabled
              className="font-bold text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">구매자 이름</Label>
            <Input
              id="customerName"
              placeholder="홍길동"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">구매자 이메일</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="example@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-1 text-sm">
            <p className="font-medium">결제 정보</p>
            <p className="text-muted-foreground">테넌트: {tenantName}</p>
            <p className="text-muted-foreground">주문 ID: ORDER-{tenantId.slice(0, 8)}...</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={loading}
          >
            취소
          </Button>
          <Button
            onClick={handlePayment}
            className="flex-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                결제하기
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TossPaymentDialog;
