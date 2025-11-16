import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, DollarSign, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface Settlement {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  instructor: {
    full_name: string;
  };
}

interface SettlementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettlementDialog = ({ open, onOpenChange }: SettlementDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPendingSettlements();
    }
  }, [open]);

  const fetchPendingSettlements = async () => {
    setLoading(true);
    try {
      // Mock data for demo purposes
      // In production, this would query actual settlement/payment data
      const mockData = [
        {
          id: "1",
          amount: 450000,
          status: "pending",
          created_at: new Date().toISOString(),
          instructor: { full_name: "김교수" },
        },
        {
          id: "2",
          amount: 320000,
          status: "pending",
          created_at: new Date().toISOString(),
          instructor: { full_name: "이강사" },
        },
        {
          id: "3",
          amount: 180000,
          status: "pending",
          created_at: new Date().toISOString(),
          instructor: { full_name: "박선생" },
        },
      ];

      setSettlements(mockData);
    } catch (error: any) {
      toast({
        title: "정산 내역 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessSettlement = async (settlementId: string) => {
    setProcessingId(settlementId);
    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "정산 처리 완료",
        description: "정산이 성공적으로 처리되었습니다.",
      });

      // Remove from list
      setSettlements(settlements.filter((s) => s.id !== settlementId));
    } catch (error: any) {
      toast({
        title: "정산 처리 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const totalAmount = settlements.reduce((sum, s) => sum + s.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>정산 처리</DialogTitle>
          <DialogDescription>
            대기 중인 정산 건을 확인하고 처리할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : settlements.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">처리 대기 중인 정산 건이 없습니다.</p>
          </div>
        ) : (
          <>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">총 정산 금액</span>
                  <span className="text-2xl font-bold">
                    ₩{totalAmount.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {settlements.map((settlement) => (
                <Card key={settlement.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {settlement.instructor.full_name}
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(settlement.created_at), "yyyy-MM-dd HH:mm")}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          ₩{settlement.amount.toLocaleString()}
                        </div>
                        <Badge variant="secondary">대기중</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="sm"
                      onClick={() => handleProcessSettlement(settlement.id)}
                      disabled={processingId === settlement.id}
                      className="w-full"
                    >
                      {processingId === settlement.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      정산 완료 처리
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
