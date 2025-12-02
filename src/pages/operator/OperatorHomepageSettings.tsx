import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/TenantContext";
import { ArrowUp, ArrowDown, Edit2, Save, X, Building2, Eye, Code } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TenantSection {
  id: string;
  tenant_id: string;
  section_type: string;
  is_visible: boolean;
  display_order: number;
  title: string | null;
  description: string | null;
  settings: Record<string, any>;
}

interface TenantOption {
  id: string;
  name: string;
  slug: string;
}

export default function OperatorHomepageSettings() {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [editingSection, setEditingSection] = useState<TenantSection | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    customHtml: "",
    customCss: "",
  });

  // Fetch available tenants for operators
  const { data: tenants } = useQuery({
    queryKey: ["available-tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data as TenantOption[];
    },
  });

  // Determine effective tenant ID
  const effectiveTenantId = selectedTenantId;

  // Fetch sections
  const { data: sections, isLoading } = useQuery({
    queryKey: ["tenant-sections", effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return [];
      
      // First, try to fetch existing sections
      const { data, error } = await supabase
        .from("tenant_sections")
        .select("*")
        .eq("tenant_id", effectiveTenantId)
        .order("display_order");

      if (error) throw error;
      
      // If no sections exist, create default ones
      if (!data || data.length === 0) {
        const { error: createError } = await supabase.rpc(
          "create_default_tenant_sections",
          { p_tenant_id: effectiveTenantId }
        );
        
        if (createError) throw createError;
        
        // Fetch again after creating
        const { data: newData, error: fetchError } = await supabase
          .from("tenant_sections")
          .select("*")
          .eq("tenant_id", effectiveTenantId)
          .order("display_order");
        
        if (fetchError) throw fetchError;
        return newData as TenantSection[];
      }
      
      return data as TenantSection[];
    },
    enabled: !!effectiveTenantId,
  });

  // Toggle visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from("tenant_sections")
        .update({ is_visible })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-sections"] });
      toast({
        title: "저장 완료",
        description: "섹션 표시 설정이 업데이트되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update order mutation - optimized with Promise.all
  const updateOrderMutation = useMutation({
    mutationFn: async (updatedSections: TenantSection[]) => {
      const updates = updatedSections.map((section, index) => 
        supabase
          .from("tenant_sections")
          .update({ display_order: index + 1 })
          .eq("id", section.id)
      );

      const results = await Promise.all(updates);
      
      // Check if any update failed
      const failedUpdate = results.find(result => result.error);
      if (failedUpdate?.error) throw failedUpdate.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-sections"] });
      toast({
        title: "저장 완료",
        description: "섹션 순서가 업데이트되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update content mutation
  const updateContentMutation = useMutation({
    mutationFn: async ({ 
      id, 
      title, 
      description, 
      settings 
    }: { 
      id: string; 
      title: string; 
      description: string;
      settings: Record<string, any>;
    }) => {
      const { error } = await supabase
        .from("tenant_sections")
        .update({ title, description, settings })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-sections"] });
      setEditingSection(null);
      toast({
        title: "저장 완료",
        description: "섹션 내용이 업데이트되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleVisibility = (section: TenantSection) => {
    toggleVisibilityMutation.mutate({
      id: section.id,
      is_visible: !section.is_visible,
    });
  };

  const handleMoveUp = (index: number) => {
    if (!sections || index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    updateOrderMutation.mutate(newSections);
  };

  const handleMoveDown = (index: number) => {
    if (!sections || index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    updateOrderMutation.mutate(newSections);
  };

  const handleEditClick = (section: TenantSection) => {
    setEditingSection(section);
    setEditForm({
      title: section.title || "",
      description: section.description || "",
      customHtml: section.settings?.customHtml || "",
      customCss: section.settings?.customCss || "",
    });
  };

  const handleSaveEdit = () => {
    if (!editingSection) return;
    updateContentMutation.mutate({
      id: editingSection.id,
      title: editForm.title,
      description: editForm.description,
      settings: {
        ...editingSection.settings,
        customHtml: editForm.customHtml,
        customCss: editForm.customCss,
      },
    });
  };

  const handlePreview = () => {
    const tenantSlug = tenants?.find(t => t.id === effectiveTenantId)?.slug;
    if (tenantSlug) {
      window.open(`/tenant/${tenantSlug}`, '_blank');
    }
  };

  const getSectionTypeName = (type: string) => {
    const names: Record<string, string> = {
      hero: "메인 히어로",
      features: "주요 기능",
      courses: "인기 강좌",
      cta: "행동 유도",
    };
    return names[type] || type;
  };

  // Check if any mutation is pending
  const isAnyPending = 
    toggleVisibilityMutation.isPending || 
    updateOrderMutation.isPending || 
    updateContentMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Show tenant selector if no tenant is selected
  if (!selectedTenantId) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">홈페이지 관리</h1>
          <p className="text-muted-foreground">
            메인 홈페이지의 섹션을 관리하고 순서를 변경할 수 있습니다.
          </p>
        </div>

        <Card className="p-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="bg-muted rounded-full p-6">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">테넌트를 선택하세요</h2>
              <p className="text-muted-foreground">
                홈페이지 설정을 관리할 테넌트를 선택해주세요.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <Label htmlFor="tenant-select">테넌트 선택</Label>
              <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                <SelectTrigger id="tenant-select">
                  <SelectValue placeholder="테넌트를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {tenants?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">홈페이지 관리</h1>
          <Button onClick={handlePreview} disabled={!effectiveTenantId}>
            <Eye className="h-4 w-4 mr-2" />
            미리보기
          </Button>
        </div>
        <p className="text-muted-foreground">
          메인 홈페이지의 섹션을 관리하고 순서를 변경할 수 있습니다.
        </p>
        
        {/* Tenant selector for operators */}
        {tenants && tenants.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <Label htmlFor="tenant-select-header" className="whitespace-nowrap">
              관리 중인 테넌트:
            </Label>
            <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
              <SelectTrigger id="tenant-select-header" className="w-[300px]">
                <SelectValue placeholder="테넌트 선택" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {(!sections || sections.length === 0) && !isLoading ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">아직 섹션이 없습니다.</p>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["tenant-sections"] })}
          >
            새로고침
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections?.map((section, index) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-3">
                    {getSectionTypeName(section.section_type)}
                    <Switch
                      checked={section.is_visible}
                      onCheckedChange={() => handleToggleVisibility(section)}
                      disabled={isAnyPending}
                    />
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {section.title && <div className="font-medium">{section.title}</div>}
                    {section.description && <div className="text-sm">{section.description}</div>}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(section)}
                    disabled={isAnyPending}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || isAnyPending}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sections.length - 1 || isAnyPending}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>섹션 수정</DialogTitle>
            <DialogDescription>
              {editingSection && getSectionTypeName(editingSection.section_type)} 섹션의 내용을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">기본 설정</TabsTrigger>
              <TabsTrigger value="custom">
                <Code className="h-4 w-4 mr-2" />
                커스텀 코드
              </TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="섹션 제목을 입력하세요"
                  disabled={updateContentMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="섹션 설명을 입력하세요"
                  rows={4}
                  disabled={updateContentMutation.isPending}
                />
              </div>
            </TabsContent>
            <TabsContent value="custom" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customHtml">커스텀 HTML</Label>
                <Textarea
                  id="customHtml"
                  value={editForm.customHtml}
                  onChange={(e) => setEditForm({ ...editForm, customHtml: e.target.value })}
                  placeholder="<div>커스텀 HTML 코드를 입력하세요</div>"
                  rows={8}
                  className="font-mono text-sm"
                  disabled={updateContentMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  이 HTML은 기본 섹션 내용 아래에 추가됩니다.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customCss">커스텀 CSS</Label>
                <Textarea
                  id="customCss"
                  value={editForm.customCss}
                  onChange={(e) => setEditForm({ ...editForm, customCss: e.target.value })}
                  placeholder=".custom-class { color: #8B5CF6; }"
                  rows={8}
                  className="font-mono text-sm"
                  disabled={updateContentMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  섹션에 적용할 CSS 스타일을 입력하세요.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditingSection(null)}
              disabled={updateContentMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              취소
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={updateContentMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateContentMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
