import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface CreateTenantFromContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: any;
  onSuccess: () => void;
}

export function CreateTenantFromContractDialog({ 
  open, 
  onOpenChange, 
  contract, 
  onSuccess 
}: CreateTenantFromContractDialogProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: contract?.customer_name || "",
    subdomain: "",
    description: "",
    contact_email: contract?.representative_email || "",
    contact_phone: contract?.representative_contact || "",
    address: "",
    billing_email: contract?.representative_email || "",
    status: "trial" as const,
  });

  const generateSubdomain = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 30);
  };

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain) return false;
    
    const { data, error } = await supabase
      .from("tenants")
      .select("subdomain")
      .eq("subdomain", subdomain)
      .maybeSingle();

    return !data && !error;
  };

  const handleSubdomainCheck = async () => {
    const subdomain = formData.subdomain || generateSubdomain(formData.name);
    const isAvailable = await checkSubdomainAvailability(subdomain);
    
    if (!isAvailable) {
      toast.error("이미 사용 중인 서브도메인입니다");
      return false;
    }
    
    setFormData(prev => ({ ...prev, subdomain }));
    return true;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      const isValid = await handleSubdomainCheck();
      if (isValid) setStep(2);
    }
  };

  const handleCreateTenant = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("인증되지 않았습니다");

      // 1. 테넌트 생성
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .insert({
          name: formData.name,
          subdomain: formData.subdomain,
          slug: formData.subdomain,
          owner_id: user.id,
          plan: contract.plan,
          max_students: contract.max_students,
          max_storage_gb: contract.max_storage_gb,
          status: formData.status,
          is_active: true,
          contract_start_date: contract.contract_start_date,
          contract_end_date: contract.contract_end_date,
          metadata: {
            description: formData.description,
            contact_email: formData.contact_email,
            contact_phone: formData.contact_phone,
            address: formData.address,
            billing_email: formData.billing_email,
            created_from_contract: true,
            contract_id: contract.id,
          },
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // 2. setup-tenant-plan Edge Function 호출
      const { data: setupData, error: setupError } = await supabase.functions.invoke(
        "setup-tenant-plan",
        {
          body: {
            tenantId: tenant.id,
            plan: contract.plan,
          },
        }
      );

      if (setupError) {
        console.error("Setup error:", setupError);
        toast.error("플랜 설정 중 오류가 발생했습니다");
      }

      // 3. 계약에 테넌트 ID 연결
      const { error: contractUpdateError } = await supabase
        .from("contracts")
        .update({
          tenant_id: tenant.id,
          status: "active",
        })
        .eq("id", contract.id);

      if (contractUpdateError) throw contractUpdateError;

      toast.success(`테넌트가 생성되었습니다: ${tenant.subdomain}.atomlms.kr`);
      onSuccess();
      onOpenChange(false);
      setStep(1);
    } catch (error: any) {
      console.error("Error creating tenant:", error);
      toast.error(error.message || "테넌트 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-lg">
        <DialogHeader>
          <DialogTitle>계약으로부터 테넌트 생성 ({step}/2)</DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                계약 정보: {contract?.customer_name} - {contract?.plan.toUpperCase()} 플랜
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="name">고객사명 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">서브도메인 *</Label>
              <div className="flex gap-2">
                <Input
                  id="subdomain"
                  value={formData.subdomain}
                  onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value }))}
                  placeholder={generateSubdomain(formData.name)}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    subdomain: generateSubdomain(formData.name) 
                  }))}
                >
                  자동생성
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.subdomain || generateSubdomain(formData.name)}.atomlms.kr
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="고객사 설명"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">담당자 이메일</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">담당자 연락처</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                최종 확인: 테넌트가 생성되면 계약 상태가 자동으로 "진행중"으로 변경됩니다.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="address">주소</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_email">청구 이메일</Label>
              <Input
                id="billing_email"
                type="email"
                value={formData.billing_email}
                onChange={(e) => setFormData(prev => ({ ...prev, billing_email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">초기 상태</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial (체험)</SelectItem>
                  <SelectItem value="active">Active (활성)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
              <h4 className="font-semibold">자동 설정 항목</h4>
              <div className="text-sm space-y-1">
                <p>• 플랜: <strong>{contract?.plan?.toUpperCase()}</strong></p>
                <p>• 최대 학생 수: <strong>{contract?.max_students || "무제한"}</strong></p>
                <p>• 스토리지: <strong>{contract?.max_storage_gb || "무제한"} GB</strong></p>
                <p>• AI 토큰: <strong>{contract?.ai_tokens_monthly?.toLocaleString()} / 월</strong></p>
                <p>• 계약 기간: <strong>{contract?.contract_start_date} ~ {contract?.contract_end_date}</strong></p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 2 && (
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              이전
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          {step === 1 ? (
            <Button onClick={handleNextStep} disabled={!formData.name}>
              다음
            </Button>
          ) : (
            <Button onClick={handleCreateTenant} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              테넌트 생성
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
