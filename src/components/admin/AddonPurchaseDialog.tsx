import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, HardDrive, Brain, CreditCard } from "lucide-react";
import { loadTossPayments } from "@tosspayments/payment-sdk";

interface AddonOption {
  type: 'student' | 'storage' | 'ai_token';
  name: string;
  description: string;
  quantity: number;
  price: number;
  icon: React.ReactNode;
}

interface AddonPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName: string;
  limitType?: 'student' | 'storage' | 'ai_token';
}

export const AddonPurchaseDialog = ({
  open,
  onOpenChange,
  tenantId,
  tenantName,
  limitType
}: AddonPurchaseDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<AddonOption | null>(null);

  const addonOptions: AddonOption[] = [
    {
      type: 'student',
      name: '학생 10명 추가',
      description: '학생 수용 인원 10명 추가',
      quantity: 10,
      price: 50000,
      icon: <Users className="h-8 w-8 text-primary" />
    },
    {
      type: 'storage',
      name: '스토리지 10GB 추가',
      description: '파일 저장 용량 10GB 추가',
      quantity: 10,
      price: 30000,
      icon: <HardDrive className="h-8 w-8 text-primary" />
    },
    {
      type: 'ai_token',
      name: 'AI 토큰 10,000개 추가',
      description: 'AI 기능 사용 토큰 10,000개 추가',
      quantity: 10000,
      price: 20000,
      icon: <Brain className="h-8 w-8 text-primary" />
    }
  ];

  const handlePurchase = async (addon: AddonOption) => {
    setLoading(true);
    setSelectedAddon(addon);

    try {
      // Generate order ID
      const orderId = `ADDON-${tenantId}-${Date.now()}`;

      // Create billing transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('billing_transactions')
        .insert({
          tenant_id: tenantId,
          order_id: orderId,
          transaction_type: `addon_${addon.type}`,
          amount: addon.price,
          quantity: addon.quantity,
          status: 'pending',
          metadata: {
            addon_name: addon.name,
            addon_description: addon.description
          }
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Prepare payment
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'toss-payment-request',
        {
          body: {
            orderId,
            orderName: addon.name,
            amount: addon.price,
            customerEmail: '',
            customerName: tenantName
          }
        }
      );

      if (paymentError) throw paymentError;

      // Load Toss Payments SDK
      const tossPayments = await loadTossPayments(
        import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
      );

      // Request payment
      await tossPayments.requestPayment('카드', paymentData.data);

      toast({
        title: "결제 진행 중",
        description: "결제 페이지로 이동합니다.",
      });

    } catch (error) {
      console.error('Error purchasing addon:', error);
      toast({
        title: "추가 구매 실패",
        description: error instanceof Error ? error.message : "오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSelectedAddon(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-lg">
        <DialogHeader>
          <DialogTitle>추가 용량 구매</DialogTitle>
          <DialogDescription>
            사용량 제한을 초과했습니다. 추가 용량을 구매하여 서비스를 계속 이용하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {addonOptions
            .filter(addon => !limitType || addon.type === limitType)
            .map((addon) => (
              <Card
                key={addon.type}
                className="p-6 flex flex-col items-center text-center space-y-4 hover:border-primary cursor-pointer transition-all"
                onClick={() => !loading && handlePurchase(addon)}
              >
                {addon.icon}
                <div>
                  <h3 className="font-semibold text-lg">{addon.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {addon.description}
                  </p>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {addon.price.toLocaleString()}원
                </div>
                <Button
                  disabled={loading && selectedAddon?.type === addon.type}
                  className="w-full"
                >
                  {loading && selectedAddon?.type === addon.type ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      구매하기
                    </>
                  )}
                </Button>
              </Card>
            ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>참고:</strong> 추가 구매한 용량은 즉시 적용되며, 현재 플랜의 제한에 추가됩니다.
            정기 결제가 아닌 일회성 구매입니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
