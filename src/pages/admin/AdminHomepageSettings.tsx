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
import { ArrowUp, ArrowDown, Edit2, Save, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TenantSection {
  id: string;
  tenant_id: string;
  section_type: string;
  is_visible: boolean;
  display_order: number;
  title: string | null;
  description: string | null;
  settings: any;
}

export default function AdminHomepageSettings() {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<TenantSection | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
  });

  // Debug: Log tenant info
  console.log('AdminHomepageSettings - Tenant:', tenant);

  // Fetch sections
  const { data: sections, isLoading } = useQuery({
    queryKey: ["tenant-sections", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) {
        console.log('No tenant ID available');
        return [];
      }
      
      console.log('Fetching sections for tenant:', tenant.id);
      
      // First, try to fetch existing sections
      const { data, error } = await supabase
        .from("tenant_sections")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("display_order");

      if (error) {
        console.error('Error fetching sections:', error);
        throw error;
      }
      
      console.log('Fetched sections:', data);
      
      // If no sections exist, create default ones
      if (!data || data.length === 0) {
        console.log('No sections found, attempting to create default sections');
        // Call the function to create default sections
        const { error: createError } = await supabase.rpc(
          "create_default_tenant_sections",
          { p_tenant_id: tenant.id }
        );
        
        if (createError) {
          console.error("Error creating default sections:", createError);
          throw createError;
        }
        
        // Fetch again after creating
        const { data: newData, error: fetchError } = await supabase
          .from("tenant_sections")
          .select("*")
          .eq("tenant_id", tenant.id)
          .order("display_order");
        
        if (fetchError) throw fetchError;
        return newData as TenantSection[];
      }
      
      return data as TenantSection[];
    },
    enabled: !!tenant?.id,
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

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (updatedSections: TenantSection[]) => {
      const updates = updatedSections.map((section, index) => ({
        id: section.id,
        display_order: index + 1,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("tenant_sections")
          .update({ display_order: update.display_order })
          .eq("id", update.id);

        if (error) throw error;
      }
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
    mutationFn: async ({ id, title, description }: { id: string; title: string; description: string }) => {
      const { error } = await supabase
        .from("tenant_sections")
        .update({ title, description })
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
    });
  };

  const handleSaveEdit = () => {
    if (!editingSection) return;
    updateContentMutation.mutate({
      id: editingSection.id,
      title: editForm.title,
      description: editForm.description,
    });
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">홈페이지 관리</h1>
        <p className="text-muted-foreground">
          메인 홈페이지의 섹션을 관리하고 순서를 변경할 수 있습니다.
        </p>
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
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sections.length - 1}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>섹션 수정</DialogTitle>
            <DialogDescription>
              {editingSection && getSectionTypeName(editingSection.section_type)} 섹션의 내용을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="섹션 제목을 입력하세요"
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSection(null)}>
              <X className="h-4 w-4 mr-2" />
              취소
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateContentMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
