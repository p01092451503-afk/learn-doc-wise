import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Plus, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
}

interface TrainingLog {
  id: string;
  course_id: string;
  training_date: string;
  training_hours: number;
  content_summary: string;
  training_method: string;
  materials_used: string | null;
  homework: string | null;
  notes: string | null;
  created_at: string;
}

const TeacherTrainingLog = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<TrainingLog | null>(null);

  const [formData, setFormData] = useState({
    training_date: new Date(),
    training_hours: 8,
    content_summary: "",
    training_method: "lecture",
    materials_used: "",
    homework: "",
    notes: ""
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLogs();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("instructor_id", user.id)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
      
      if (data && data.length > 0) {
        setSelectedCourse(data[0].id);
      }
    } catch (error: any) {
      toast({
        title: "강의 목록 로딩 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchLogs = async () => {
    if (!selectedCourse) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("training_logs")
        .select("*")
        .eq("course_id", selectedCourse)
        .order("training_date", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast({
        title: "훈련일지 로딩 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCourse) {
      toast({
        title: "강의를 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    if (!formData.content_summary.trim()) {
      toast({
        title: "훈련 내용을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다");

      const logData = {
        course_id: selectedCourse,
        instructor_id: user.id,
        training_date: format(formData.training_date, "yyyy-MM-dd"),
        training_hours: formData.training_hours,
        content_summary: formData.content_summary,
        training_method: formData.training_method,
        materials_used: formData.materials_used || null,
        homework: formData.homework || null,
        notes: formData.notes || null,
      };

      if (editingLog) {
        const { error } = await supabase
          .from("training_logs")
          .update(logData)
          .eq("id", editingLog.id);

        if (error) throw error;

        toast({
          title: "훈련일지 수정 완료",
          description: "훈련일지가 성공적으로 수정되었습니다.",
        });
      } else {
        const { error } = await supabase
          .from("training_logs")
          .insert(logData);

        if (error) throw error;

        toast({
          title: "훈련일지 작성 완료",
          description: "훈련일지가 성공적으로 저장되었습니다.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchLogs();
    } catch (error: any) {
      toast({
        title: editingLog ? "훈련일지 수정 실패" : "훈련일지 작성 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      training_date: new Date(),
      training_hours: 8,
      content_summary: "",
      training_method: "lecture",
      materials_used: "",
      homework: "",
      notes: ""
    });
    setEditingLog(null);
  };

  const handleEdit = (log: TrainingLog) => {
    setEditingLog(log);
    setFormData({
      training_date: new Date(log.training_date),
      training_hours: log.training_hours,
      content_summary: log.content_summary,
      training_method: log.training_method,
      materials_used: log.materials_used || "",
      homework: log.homework || "",
      notes: log.notes || ""
    });
    setIsDialogOpen(true);
  };

  const trainingMethodLabels: Record<string, string> = {
    lecture: "강의",
    practice: "실습",
    discussion: "토론",
    project: "프로젝트",
    exam: "시험",
    other: "기타"
  };

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">훈련일지 관리</h1>
            <p className="text-muted-foreground mt-2">
              일일 훈련 내용과 진행 사항을 기록하고 관리합니다
            </p>
          </div>
          <Button onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" />
            훈련일지 작성
          </Button>
        </div>

        {/* 강의 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>강의 선택</CardTitle>
            <CardDescription>훈련일지를 관리할 강의를 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="강의를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* 훈련일지 목록 */}
        {selectedCourse && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">훈련일지 목록</h2>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                엑셀 다운로드
              </Button>
            </div>

            {loading ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">로딩 중...</p>
                </CardContent>
              </Card>
            ) : logs.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center space-y-2">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">작성된 훈련일지가 없습니다</p>
                    <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      첫 훈련일지 작성하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {logs.map((log) => (
                  <Card key={log.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {format(new Date(log.training_date), "yyyy년 MM월 dd일 (EEEE)", { locale: ko })}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {trainingMethodLabels[log.training_method]} • {log.training_hours}시간
                          </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(log)}>
                          수정
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">훈련 내용</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {log.content_summary}
                        </p>
                      </div>
                      {log.materials_used && (
                        <div>
                          <h4 className="font-semibold text-sm mb-1">사용 교재/자료</h4>
                          <p className="text-sm text-muted-foreground">{log.materials_used}</p>
                        </div>
                      )}
                      {log.homework && (
                        <div>
                          <h4 className="font-semibold text-sm mb-1">과제</h4>
                          <p className="text-sm text-muted-foreground">{log.homework}</p>
                        </div>
                      )}
                      {log.notes && (
                        <div>
                          <h4 className="font-semibold text-sm mb-1">특이사항</h4>
                          <p className="text-sm text-muted-foreground">{log.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 훈련일지 작성/수정 다이얼로그 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLog ? "훈련일지 수정" : "훈련일지 작성"}
              </DialogTitle>
              <DialogDescription>
                일일 훈련 내용과 진행 사항을 상세히 기록하세요
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="training_date">훈련일자 *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.training_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.training_date ? (
                          format(formData.training_date, "yyyy년 MM월 dd일", { locale: ko })
                        ) : (
                          <span>날짜를 선택하세요</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.training_date}
                        onSelect={(date) => date && setFormData({ ...formData, training_date: date })}
                        locale={ko}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training_hours">훈련시간 *</Label>
                  <Input
                    id="training_hours"
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={formData.training_hours}
                    onChange={(e) => setFormData({ ...formData, training_hours: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="training_method">교육방법 *</Label>
                <Select
                  value={formData.training_method}
                  onValueChange={(value) => setFormData({ ...formData, training_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(trainingMethodLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content_summary">훈련 내용 요약 *</Label>
                <Textarea
                  id="content_summary"
                  placeholder="오늘 진행한 훈련 내용을 상세히 기록하세요..."
                  rows={6}
                  value={formData.content_summary}
                  onChange={(e) => setFormData({ ...formData, content_summary: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="materials_used">사용 교재/자료</Label>
                <Textarea
                  id="materials_used"
                  placeholder="사용한 교재, 교육 자료, 참고 자료 등을 기록하세요"
                  rows={2}
                  value={formData.materials_used}
                  onChange={(e) => setFormData({ ...formData, materials_used: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="homework">과제</Label>
                <Textarea
                  id="homework"
                  placeholder="부여한 과제가 있다면 기록하세요"
                  rows={2}
                  value={formData.homework}
                  onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">특이사항</Label>
                <Textarea
                  id="notes"
                  placeholder="특이사항, 보완사항, 개선점 등을 기록하세요"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSubmit}>
                {editingLog ? "수정" : "저장"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TeacherTrainingLog;
