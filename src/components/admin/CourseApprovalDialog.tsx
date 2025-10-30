import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  status: string;
  level: string;
  profiles: {
    full_name: string;
  };
}

interface CourseApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CourseApprovalDialog = ({ open, onOpenChange }: CourseApprovalDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPendingCourses();
    }
  }, [open]);

  const fetchPendingCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          description,
          instructor_id,
          status,
          level
        `)
        .eq("status", "draft")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch instructor names separately
      const coursesWithInstructors = await Promise.all(
        (data || []).map(async (course) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", course.instructor_id)
            .single();

          return {
            ...course,
            profiles: {
              full_name: profile?.full_name || "Unknown",
            },
          };
        })
      );

      setCourses(coursesWithInstructors);
    } catch (error: any) {
      toast({
        title: "강의 목록 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId: string) => {
    setProcessingId(courseId);
    try {
      const { error } = await supabase
        .from("courses")
        .update({ 
          status: "published",
          publish_date: new Date().toISOString()
        })
        .eq("id", courseId);

      if (error) throw error;

      toast({
        title: "강의 승인 완료",
        description: "강의가 성공적으로 승인되었습니다.",
      });

      // Remove from list
      setCourses(courses.filter((c) => c.id !== courseId));
    } catch (error: any) {
      toast({
        title: "승인 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (courseId: string) => {
    setProcessingId(courseId);
    try {
      const { error } = await supabase
        .from("courses")
        .update({ status: "archived" })
        .eq("id", courseId);

      if (error) throw error;

      toast({
        title: "강의 거부 완료",
        description: "강의가 거부되었습니다.",
      });

      // Remove from list
      setCourses(courses.filter((c) => c.id !== courseId));
    } catch (error: any) {
      toast({
        title: "거부 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>강의 승인 관리</DialogTitle>
          <DialogDescription>
            검토 대기 중인 강의를 승인하거나 거부할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">검토 대기 중인 강의가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{course.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          강사: {course.profiles?.full_name || "Unknown"}
                        </span>
                        <Badge variant="secondary">{course.level}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.description || "설명 없음"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(course.id)}
                      disabled={processingId === course.id}
                      className="flex-1"
                    >
                      {processingId === course.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      승인
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(course.id)}
                      disabled={processingId === course.id}
                      className="flex-1"
                    >
                      {processingId === course.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      거부
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
