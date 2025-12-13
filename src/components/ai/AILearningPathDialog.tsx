import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Route } from "lucide-react";
import { AITokenNotice } from "./AITokenNotice";

interface AILearningPathDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AILearningPathDialog = ({ open, onOpenChange }: AILearningPathDialogProps) => {
  const [userLevel, setUserLevel] = useState("");
  const [interests, setInterests] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLevel || !interests || !learningGoal) {
      toast({
        title: "입력 필요",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-learning-path', {
        body: { userLevel, interests, learningGoal }
      });

      if (error) throw error;
      setResult(data.learningPath);
      
      toast({
        title: "학습 경로 생성 완료",
        description: "맞춤형 학습 경로가 생성되었습니다.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "오류 발생",
        description: "학습 경로 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
              <Route className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span>AI 학습 경로 추천</span>
              <span className="text-xs bg-gradient-to-r from-primary to-accent text-white px-2 py-0.5 rounded-full font-bold">AI</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <AITokenNotice />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="level">현재 수준</Label>
            <Select value={userLevel} onValueChange={setUserLevel}>
              <SelectTrigger>
                <SelectValue placeholder="수준을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">초급</SelectItem>
                <SelectItem value="intermediate">중급</SelectItem>
                <SelectItem value="advanced">고급</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">관심 분야</Label>
            <Input
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="예: 웹 개발, 데이터 분석, 디자인 등"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">학습 목표</Label>
            <Textarea
              id="goal"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              placeholder="달성하고 싶은 목표를 입력하세요"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : (
              "학습 경로 생성"
            )}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">추천 학습 경로</h3>
              <div className="whitespace-pre-wrap text-sm">{result}</div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
