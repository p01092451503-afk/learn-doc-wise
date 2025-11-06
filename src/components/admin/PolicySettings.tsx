import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";

interface PolicySettingsProps {
  tenantId: string;
}

export const PolicySettings = ({ tenantId }: PolicySettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [policies, setPolicies] = useState({
    enrollment_policy: "",
    refund_policy: "",
    attendance_policy: "",
    grading_policy: "",
    auto_approve_enrollments: false,
    allow_self_enrollment: true,
    max_enrollments_per_user: 10,
    refund_period_days: 7,
  });

  useEffect(() => {
    loadPolicies();
  }, [tenantId]);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("metadata")
        .eq("id", tenantId)
        .single();

      if (error) throw error;

      if (data?.metadata && typeof data.metadata === 'object') {
        const metadata = data.metadata as any;
        if (metadata.policies) {
          setPolicies(prev => ({ ...prev, ...metadata.policies }));
        }
      }
    } catch (error: any) {
      console.error("Error loading policies:", error);
      toast.error("정책을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: tenant, error: fetchError } = await supabase
        .from("tenants")
        .select("metadata")
        .eq("id", tenantId)
        .single();

      if (fetchError) throw fetchError;

      const currentMetadata = (tenant?.metadata && typeof tenant.metadata === 'object') 
        ? tenant.metadata as any 
        : {};
      
      const updatedMetadata = {
        ...currentMetadata,
        policies,
      };

      const { error } = await supabase
        .from("tenants")
        .update({ metadata: updatedMetadata })
        .eq("id", tenantId);

      if (error) throw error;

      toast.success("정책 설정이 저장되었습니다");
    } catch (error: any) {
      console.error("Error saving policies:", error);
      toast.error("정책 저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          운영 정책
        </CardTitle>
        <CardDescription>
          테넌트의 기본 운영 정책을 설정합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>자동 수강 승인</Label>
              <p className="text-sm text-muted-foreground">
                학생의 수강 신청을 자동으로 승인합니다
              </p>
            </div>
            <Switch
              checked={policies.auto_approve_enrollments}
              onCheckedChange={(checked) => setPolicies(prev => ({ ...prev, auto_approve_enrollments: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>자율 수강 신청 허용</Label>
              <p className="text-sm text-muted-foreground">
                학생이 직접 강의를 찾아 수강 신청할 수 있습니다
              </p>
            </div>
            <Switch
              checked={policies.allow_self_enrollment}
              onCheckedChange={(checked) => setPolicies(prev => ({ ...prev, allow_self_enrollment: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_enrollments">사용자당 최대 수강 강의 수</Label>
            <Input
              id="max_enrollments"
              type="number"
              min="1"
              value={policies.max_enrollments_per_user}
              onChange={(e) => setPolicies(prev => ({ ...prev, max_enrollments_per_user: parseInt(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund_period">환불 가능 기간 (일)</Label>
            <Input
              id="refund_period"
              type="number"
              min="0"
              value={policies.refund_period_days}
              onChange={(e) => setPolicies(prev => ({ ...prev, refund_period_days: parseInt(e.target.value) }))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="enrollment_policy">수강 정책</Label>
            <Textarea
              id="enrollment_policy"
              value={policies.enrollment_policy}
              onChange={(e) => setPolicies(prev => ({ ...prev, enrollment_policy: e.target.value }))}
              placeholder="수강 신청 및 취소에 관한 정책을 입력하세요"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund_policy">환불 정책</Label>
            <Textarea
              id="refund_policy"
              value={policies.refund_policy}
              onChange={(e) => setPolicies(prev => ({ ...prev, refund_policy: e.target.value }))}
              placeholder="환불 조건 및 절차에 관한 정책을 입력하세요"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendance_policy">출석 정책</Label>
            <Textarea
              id="attendance_policy"
              value={policies.attendance_policy}
              onChange={(e) => setPolicies(prev => ({ ...prev, attendance_policy: e.target.value }))}
              placeholder="출석 인정 기준 및 절차를 입력하세요"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grading_policy">평가 정책</Label>
            <Textarea
              id="grading_policy"
              value={policies.grading_policy}
              onChange={(e) => setPolicies(prev => ({ ...prev, grading_policy: e.target.value }))}
              placeholder="성적 평가 기준 및 방법을 입력하세요"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            저장
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
