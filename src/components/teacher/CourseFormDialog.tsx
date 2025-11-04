import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Course {
  id?: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  duration_hours: number;
  price: number;
  status: "draft" | "published" | "archived";
  slug: string;
  category_id?: string;
}

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  onSuccess: () => void;
}

export const CourseFormDialog = ({
  open,
  onOpenChange,
  course,
  onSuccess,
}: CourseFormDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<Course>({
    title: "",
    description: "",
    level: "beginner",
    duration_hours: 0,
    price: 0,
    status: "draft",
    slug: "",
    category_id: undefined,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (course) {
      setFormData({
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        duration_hours: course.duration_hours,
        price: course.price,
        status: course.status,
        slug: course.slug,
        category_id: course.category_id,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        level: "beginner",
        duration_hours: 0,
        price: 0,
        status: "draft",
        slug: "",
        category_id: undefined,
      });
    }
  }, [course, open]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("인증이 필요합니다");
      }

      // Generate slug if not provided
      const slug = formData.slug || generateSlug(formData.title);

      const courseData = {
        title: formData.title,
        description: formData.description,
        level: formData.level,
        duration_hours: formData.duration_hours,
        price: formData.price,
        status: formData.status,
        slug,
        category_id: formData.category_id,
        instructor_id: user.id,
      };

      if (course?.id) {
        // Update existing course
        const { error } = await supabase
          .from("courses")
          .update(courseData)
          .eq("id", course.id);

        if (error) throw error;

        toast({
          title: "강의 수정 완료",
          description: "강의가 성공적으로 수정되었습니다.",
        });
      } else {
        // Create new course
        const { error } = await supabase
          .from("courses")
          .insert(courseData);

        if (error) throw error;

        toast({
          title: "강의 생성 완료",
          description: "새 강의가 성공적으로 생성되었습니다.",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast({
        title: "오류",
        description: error.message || "강의 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: value,
      slug: generateSlug(value),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {course ? "강의 수정" : "새 강의 만들기"}
          </DialogTitle>
          <DialogDescription>
            {course
              ? "강의 정보를 수정하세요"
              : "새로운 강의를 만들기 위한 기본 정보를 입력하세요"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">강의 제목 *</Label>
            <Input
              id="title"
              placeholder="예: React 완벽 가이드"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL 슬러그</Label>
            <Input
              id="slug"
              placeholder="react-complete-guide"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              강의 URL에 사용됩니다. 영문, 숫자, 하이픈만 사용 가능
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">강의 설명 *</Label>
            <Textarea
              id="description"
              placeholder="강의에 대한 자세한 설명을 입력하세요"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">난이도 *</Label>
              <Select
                value={formData.level}
                onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                  setFormData({ ...formData, level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="난이도 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">초급</SelectItem>
                  <SelectItem value="intermediate">중급</SelectItem>
                  <SelectItem value="advanced">고급</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">상태 *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "draft" | "published" | "archived") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">준비중</SelectItem>
                  <SelectItem value="published">공개</SelectItem>
                  <SelectItem value="archived">보관됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">총 강의 시간 (시간) *</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                step="0.5"
                placeholder="24"
                value={formData.duration_hours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_hours: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">가격 (원) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1000"
                placeholder="99000"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Select
              value={formData.category_id || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, category_id: value || undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택 (선택사항)" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {course ? "수정하기" : "생성하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
