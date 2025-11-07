import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, Mail, User } from "lucide-react";

interface AutoBillingSettingsProps {
  tenantId: string;
}

export const AutoBillingSettings = ({ tenantId }: AutoBillingSettingsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    enabled: false,
    billingEmail: '',
    billingName: '',
    autoChargeOnLimit: false,
    studentAddonPrice: 50000,
    storageAddonPrice: 30000,
    aiTokenAddonPrice: 20000,
  });

  useEffect(() => {
    fetchSettings();
  }, [tenantId]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('auto_billing_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          enabled: data.enabled,
          billingEmail: data.billing_email || '',
          billingName: data.billing_name || '',
          autoChargeOnLimit: data.auto_charge_on_limit,
          studentAddonPrice: data.student_addon_price,
          storageAddonPrice: data.storage_addon_price,
          aiTokenAddonPrice: data.ai_token_addon_price,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "설정 불러오기 실패",
        description: "자동 과금 설정을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('auto_billing_settings')
        .upsert({
          tenant_id: tenantId,
          enabled: settings.enabled,
          billing_email: settings.billingEmail,
          billing_name: settings.billingName,
          auto_charge_on_limit: settings.autoChargeOnLimit,
          student_addon_price: settings.studentAddonPrice,
          storage_addon_price: settings.storageAddonPrice,
          ai_token_addon_price: settings.aiTokenAddonPrice,
        });

      if (error) throw error;

      toast({
        title: "설정 저장 완료",
        description: "자동 과금 설정이 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "설정 저장 실패",
        description: "설정을 저장하는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>자동 과금 설정</CardTitle>
        <CardDescription>
          사용량 제한 초과 시 자동으로 추가 용량을 구매하도록 설정할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Auto Billing */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex-1">
            <Label htmlFor="enabled">자동 과금 활성화</Label>
            <p className="text-sm text-muted-foreground">
              사용량 제한 도달 시 자동으로 결제를 진행합니다.
            </p>
          </div>
          <Switch
            id="enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Billing Contact Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="billingEmail">
                  <Mail className="inline h-4 w-4 mr-2" />
                  결제 담당자 이메일
                </Label>
                <Input
                  id="billingEmail"
                  type="email"
                  placeholder="billing@example.com"
                  value={settings.billingEmail}
                  onChange={(e) => setSettings({ ...settings, billingEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingName">
                  <User className="inline h-4 w-4 mr-2" />
                  결제 담당자 이름
                </Label>
                <Input
                  id="billingName"
                  placeholder="홍길동"
                  value={settings.billingName}
                  onChange={(e) => setSettings({ ...settings, billingName: e.target.value })}
                />
              </div>
            </div>

            {/* Auto Charge on Limit */}
            <div className="flex items-center justify-between space-x-2">
              <div className="flex-1">
                <Label htmlFor="autoCharge">제한 초과 시 자동 결제</Label>
                <p className="text-sm text-muted-foreground">
                  사용량이 제한에 도달하면 즉시 자동으로 추가 구매를 진행합니다.
                </p>
              </div>
              <Switch
                id="autoCharge"
                checked={settings.autoChargeOnLimit}
                onCheckedChange={(checked) => setSettings({ ...settings, autoChargeOnLimit: checked })}
              />
            </div>

            {/* Addon Prices */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                추가 용량 가격 설정
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentPrice">학생 10명 추가</Label>
                  <Input
                    id="studentPrice"
                    type="number"
                    min="0"
                    step="1000"
                    value={settings.studentAddonPrice}
                    onChange={(e) => setSettings({ ...settings, studentAddonPrice: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">원</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storagePrice">스토리지 10GB 추가</Label>
                  <Input
                    id="storagePrice"
                    type="number"
                    min="0"
                    step="1000"
                    value={settings.storageAddonPrice}
                    onChange={(e) => setSettings({ ...settings, storageAddonPrice: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">원</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiTokenPrice">AI 토큰 10,000개 추가</Label>
                  <Input
                    id="aiTokenPrice"
                    type="number"
                    min="0"
                    step="1000"
                    value={settings.aiTokenAddonPrice}
                    onChange={(e) => setSettings({ ...settings, aiTokenAddonPrice: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">원</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              '설정 저장'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
