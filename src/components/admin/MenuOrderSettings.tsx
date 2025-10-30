import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  DollarSign,
  FolderOpen,
  Building2,
  Brain,
  Shield,
  Save,
  RotateCcw,
} from "lucide-react";

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  path: string;
  enabled: boolean;
}

const iconMap: { [key: string]: any } = {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  DollarSign,
  FolderOpen,
  Building2,
  Brain,
  Shield,
};

const defaultMenuItems = {
  student: [
    { id: "dashboard", icon: "LayoutDashboard", label: "대시보드", path: "/student", enabled: true },
    { id: "courses", icon: "BookOpen", label: "내 강의", path: "/student/courses", enabled: true },
    { id: "assignments", icon: "FileText", label: "과제", path: "/student/assignments", enabled: true },
    { id: "community", icon: "MessageSquare", label: "커뮤니티", path: "/student/community", enabled: true },
    { id: "analytics", icon: "BarChart3", label: "학습 통계", path: "/student/analytics", enabled: true },
  ],
  teacher: [
    { id: "dashboard", icon: "LayoutDashboard", label: "대시보드", path: "/teacher", enabled: true },
    { id: "courses", icon: "BookOpen", label: "강의 관리", path: "/teacher/courses", enabled: true },
    { id: "assignments", icon: "FileText", label: "과제 관리", path: "/teacher/assignments", enabled: true },
    { id: "students", icon: "Users", label: "학생 관리", path: "/teacher/students", enabled: true },
    { id: "analytics", icon: "BarChart3", label: "통계", path: "/teacher/analytics", enabled: true },
    { id: "revenue", icon: "DollarSign", label: "수익", path: "/teacher/revenue", enabled: true },
  ],
  admin: [
    { id: "dashboard", icon: "LayoutDashboard", label: "대시보드", path: "/admin", enabled: true },
    { id: "users", icon: "Users", label: "사용자 관리", path: "/admin/users", enabled: true },
    { id: "courses", icon: "BookOpen", label: "강좌 관리", path: "/admin/courses", enabled: true },
    { id: "content", icon: "FolderOpen", label: "콘텐츠 관리", path: "/admin/content", enabled: true },
    { id: "learning", icon: "BarChart3", label: "학습 관리", path: "/admin/learning", enabled: true },
    { id: "tenants", icon: "Building2", label: "고객사 관리", path: "/admin/tenants", enabled: true },
    { id: "revenue", icon: "DollarSign", label: "매출 관리", path: "/admin/revenue", enabled: true },
    { id: "ai-logs", icon: "Brain", label: "AI 로그", path: "/admin/ai-logs", enabled: true },
    { id: "monitoring", icon: "Shield", label: "시스템 모니터링", path: "/admin/monitoring", enabled: true },
    { id: "settings", icon: "Settings", label: "시스템 설정", path: "/admin/settings", enabled: true },
  ],
};

interface SortableItemProps {
  item: MenuItem;
}

function SortableItem({ item }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = iconMap[item.icon];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-background border rounded-lg hover:shadow-sm transition-shadow"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex items-center gap-3 flex-1">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
        </div>
        <span className="font-medium">{item.label}</span>
      </div>
      <Badge variant={item.enabled ? "default" : "secondary"}>
        {item.enabled ? "활성" : "비활성"}
      </Badge>
    </div>
  );
}

const MenuOrderSettings = () => {
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "admin">("admin");
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems[selectedRole]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchMenuOrder();
  }, [selectedRole]);

  const fetchMenuOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_order")
        .select("menu_items")
        .eq("user_role", selectedRole)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setMenuItems(JSON.parse(JSON.stringify(data.menu_items)) as MenuItem[]);
      } else {
        setMenuItems(defaultMenuItems[selectedRole]);
      }
    } catch (error) {
      console.error("Error fetching menu order:", error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMenuItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("menu_order")
        .upsert(
          {
            user_role: selectedRole,
            menu_items: JSON.parse(JSON.stringify(menuItems)),
          },
          {
            onConflict: "user_role",
          }
        );

      if (error) throw error;

      toast({
        title: "저장 완료",
        description: "메뉴 순서가 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      console.error("Error saving menu order:", error);
      toast({
        title: "저장 실패",
        description: "메뉴 순서 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMenuItems(defaultMenuItems[selectedRole]);
    toast({
      title: "초기화 완료",
      description: "메뉴 순서가 기본값으로 초기화되었습니다.",
    });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>메뉴 순서 설정</CardTitle>
        <CardDescription>
          각 사용자 역할별 좌측 메뉴의 순서를 드래그하여 변경할 수 있습니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium">사용자 역할</label>
            <p className="text-sm text-muted-foreground">
              설정할 사용자 역할을 선택하세요
            </p>
          </div>
          <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">학생</SelectItem>
              <SelectItem value="teacher">강사</SelectItem>
              <SelectItem value="admin">관리자</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">메뉴 항목 순서</p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={menuItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <SortableItem key={item.id} item={item} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            기본값으로 초기화
          </Button>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? "저장 중..." : "변경사항 저장"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuOrderSettings;
