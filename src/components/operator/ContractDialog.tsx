import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: any;
  onSuccess: () => void;
}

const PLAN_CONFIGS = {
  starter: { price: 0, students: null, storage: 5, tokens: 0 },
  standard: { price: 150000, students: 200, storage: 50, tokens: 0 },
  pro: { price: 300000, students: 500, storage: 100, tokens: 100000 },
  professional: { price: 600000, students: 2000, storage: 300, tokens: 500000 },
  enterprise: { price: 1200000, students: null, storage: null, tokens: 1000000 },
  enterprise_hrd: { price: 2000000, students: null, storage: null, tokens: 2000000 },
};

export function ContractDialog({ open, onOpenChange, contract, onSuccess }: ContractDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    business_registration_number: "",
    representative_name: "",
    representative_contact: "",
    representative_email: "",
    plan: "standard",
    contract_amount: 150000,
    contract_start_date: "",
    contract_end_date: "",
    billing_cycle: "monthly",
    payment_method: "",
    max_students: 200,
    max_storage_gb: 50,
    ai_tokens_monthly: 0,
    customer_requirements: "",
    sales_representative: "",
    technical_representative: "",
    notes: "",
  });

  useEffect(() => {
    if (contract) {
      setFormData({
        customer_name: contract.customer_name || "",
        business_registration_number: contract.business_registration_number || "",
        representative_name: contract.representative_name || "",
        representative_contact: contract.representative_contact || "",
        representative_email: contract.representative_email || "",
        plan: contract.plan || "standard",
        contract_amount: contract.contract_amount || 0,
        contract_start_date: contract.contract_start_date || "",
        contract_end_date: contract.contract_end_date || "",
        billing_cycle: contract.billing_cycle || "monthly",
        payment_method: contract.payment_method || "",
        max_students: contract.max_students || null,
        max_storage_gb: contract.max_storage_gb || null,
        ai_tokens_monthly: contract.ai_tokens_monthly || 0,
        customer_requirements: typeof contract.customer_requirements === 'object' 
          ? JSON.stringify(contract.customer_requirements, null, 2) 
          : contract.customer_requirements || "",
        sales_representative: contract.sales_representative || "",
        technical_representative: contract.technical_representative || "",
        notes: contract.notes || "",
      });
    }
  }, [contract]);

  const handlePlanChange = (plan: string) => {
    const config = PLAN_CONFIGS[plan as keyof typeof PLAN_CONFIGS];
    setFormData(prev => ({
      ...prev,
      plan,
      contract_amount: config.price,
      max_students: config.students,
      max_storage_gb: config.storage,
      ai_tokens_monthly: config.tokens,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let customerRequirementsJson = {};
      try {
        customerRequirementsJson = formData.customer_requirements 
          ? JSON.parse(formData.customer_requirements) 
          : {};
      } catch {
        customerRequirementsJson = { notes: formData.customer_requirements };
      }

      if (contract) {
        // 수정
        const { error } = await supabase
          .from("contracts")
          .update({
            ...formData,
            customer_requirements: customerRequirementsJson,
          })
          .eq("id", contract.id);

        if (error) throw error;
        toast.success("계약이 수정되었습니다");
      } else {
        // 신규 생성 - 계약번호 자동 생성
        const { data: contractNumber } = await supabase.rpc("generate_contract_number");
        
        const { error } = await supabase
          .from("contracts")
          .insert({
            ...formData,
            contract_number: contractNumber,
            customer_requirements: customerRequirementsJson,
            created_by: user.id,
            status: "pending",
          });

        if (error) throw error;
        toast.success("계약이 등록되었습니다");
      }

      onSuccess();
      onOpenChange(false);
      
      // 폼 초기화
      setFormData({
        customer_name: "",
        business_registration_number: "",
        representative_name: "",
        representative_contact: "",
        representative_email: "",
        plan: "standard",
        contract_amount: 150000,
        contract_start_date: "",
        contract_end_date: "",
        billing_cycle: "monthly",
        payment_method: "",
        max_students: 200,
        max_storage_gb: 50,
        ai_tokens_monthly: 0,
        customer_requirements: "",
        sales_representative: "",
        technical_representative: "",
        notes: "",
      });
    } catch (error: any) {
      console.error("Error saving contract:", error);
      toast.error(error.message || "계약 저장에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contract ? "계약 수정" : "신규 계약 등록"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 고객사 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">고객사 기본 정보</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">고객사명 *</Label>
                <Input
                  id="customer_name"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_registration_number">사업자등록번호</Label>
                <Input
                  id="business_registration_number"
                  value={formData.business_registration_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, business_registration_number: e.target.value }))}
                  placeholder="000-00-00000"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="representative_name">대표자명 *</Label>
                <Input
                  id="representative_name"
                  required
                  value={formData.representative_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, representative_name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="representative_contact">대표자 연락처 *</Label>
                <Input
                  id="representative_contact"
                  required
                  value={formData.representative_contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, representative_contact: e.target.value }))}
                  placeholder="010-0000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="representative_email">대표자 이메일 *</Label>
                <Input
                  id="representative_email"
                  type="email"
                  required
                  value={formData.representative_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, representative_email: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* 계약 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">계약 정보</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan">플랜 *</Label>
                <Select value={formData.plan} onValueChange={handlePlanChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter (무료)</SelectItem>
                    <SelectItem value="standard">Standard (150,000원)</SelectItem>
                    <SelectItem value="pro">Pro (300,000원)</SelectItem>
                    <SelectItem value="professional">Professional (600,000원)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (1,200,000원)</SelectItem>
                    <SelectItem value="enterprise_hrd">Enterprise HRD (2,000,000원)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract_amount">계약 금액 (원) *</Label>
                <Input
                  id="contract_amount"
                  type="number"
                  required
                  value={formData.contract_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, contract_amount: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract_start_date">계약 시작일 *</Label>
                <Input
                  id="contract_start_date"
                  type="date"
                  required
                  value={formData.contract_start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, contract_start_date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract_end_date">계약 종료일 *</Label>
                <Input
                  id="contract_end_date"
                  type="date"
                  required
                  value={formData.contract_end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, contract_end_date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_cycle">결제 주기 *</Label>
                <Select value={formData.billing_cycle} onValueChange={(value) => setFormData(prev => ({ ...prev, billing_cycle: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">월간</SelectItem>
                    <SelectItem value="yearly">연간</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">결제 방법</Label>
              <Input
                id="payment_method"
                value={formData.payment_method}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                placeholder="계좌이체, 카드결제 등"
              />
            </div>
          </div>

          {/* 리소스 제한 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">리소스 제한</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_students">최대 학생 수</Label>
                <Input
                  id="max_students"
                  type="number"
                  value={formData.max_students || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_students: e.target.value ? parseInt(e.target.value) : null }))}
                  placeholder="무제한"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_storage_gb">스토리지 (GB)</Label>
                <Input
                  id="max_storage_gb"
                  type="number"
                  value={formData.max_storage_gb || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_storage_gb: e.target.value ? parseFloat(e.target.value) : null }))}
                  placeholder="무제한"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai_tokens_monthly">AI 토큰 (월)</Label>
                <Input
                  id="ai_tokens_monthly"
                  type="number"
                  value={formData.ai_tokens_monthly}
                  onChange={(e) => setFormData(prev => ({ ...prev, ai_tokens_monthly: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>

          {/* 고객 요구사항 */}
          <div className="space-y-2">
            <Label htmlFor="customer_requirements">고객 요구사항 (JSON 또는 텍스트)</Label>
            <Textarea
              id="customer_requirements"
              rows={4}
              value={formData.customer_requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_requirements: e.target.value }))}
              placeholder='{"features": ["AI 기능", "HRD 연동"], "notes": "기타 요청사항"}'
            />
          </div>

          {/* 비고 */}
          <div className="space-y-2">
            <Label htmlFor="notes">비고</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="추가 메모 사항"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {contract ? "수정" : "등록"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
