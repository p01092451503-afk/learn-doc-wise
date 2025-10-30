import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { HardDrive, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StorageUsageProps {
  tenantId?: string;
  userId?: string;
}

export const StorageUsage = ({ tenantId, userId }: StorageUsageProps) => {
  const [usage, setUsage] = useState({
    total_bytes: 0,
    video_bytes: 0,
    document_bytes: 0,
    image_bytes: 0,
  });
  const [maxStorage, setMaxStorage] = useState(10); // GB
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStorageUsage();
  }, [tenantId, userId]);

  const fetchStorageUsage = async () => {
    try {
      let query = supabase.from('storage_usage').select('*');
      
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      } else if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setUsage(data);
      }

      // 테넌트의 최대 용량 가져오기
      if (tenantId) {
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('max_storage_gb')
          .eq('id', tenantId)
          .single();

        if (tenantData) {
          setMaxStorage(tenantData.max_storage_gb);
        }
      }
    } catch (error) {
      console.error('스토리지 사용량 조회 오류:', error);
      toast({
        title: "오류",
        description: "스토리지 사용량을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const maxBytes = maxStorage * 1073741824; // GB to Bytes
  const usagePercent = (usage.total_bytes / maxBytes) * 100;
  const isNearLimit = usagePercent >= 80;
  const isOverLimit = usagePercent >= 100;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            <CardTitle>스토리지 사용량</CardTitle>
          </div>
          {isNearLimit && (
            <Badge variant={isOverLimit ? "destructive" : "secondary"}>
              {isOverLimit ? "용량 초과" : "용량 부족"}
            </Badge>
          )}
        </div>
        <CardDescription>
          {formatBytes(usage.total_bytes)} / {maxStorage}GB 사용 중
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Progress value={Math.min(usagePercent, 100)} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {usagePercent.toFixed(1)}% 사용 중
          </p>
        </div>

        {isNearLimit && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-destructive mb-1">
                {isOverLimit ? "스토리지 용량이 초과되었습니다" : "스토리지 용량이 부족합니다"}
              </p>
              <p className="text-muted-foreground">
                {isOverLimit
                  ? "더 이상 파일을 업로드할 수 없습니다. 불필요한 파일을 삭제하거나 요금제를 업그레이드하세요."
                  : "곧 스토리지 용량이 가득 찰 예정입니다. 요금제 업그레이드를 고려해보세요."}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground mb-1">동영상</p>
            <p className="text-sm font-semibold">{formatBytes(usage.video_bytes)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">문서</p>
            <p className="text-sm font-semibold">{formatBytes(usage.document_bytes)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">이미지</p>
            <p className="text-sm font-semibold">{formatBytes(usage.image_bytes)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};