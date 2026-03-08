import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp } from "lucide-react";
import { AITokenNotice } from "./AITokenNotice";

interface AIProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AIProgressDialog = ({ open, onOpenChange }: AIProgressDialogProps) => {
  const [currentProgress, setCurrentProgress] = useState("");
  const [studyPattern, setStudyPattern] = useState("");
  const [targetCompletion, setTargetCompletion] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProgress || !studyPattern || !targetCompletion) {
      toast({
        title: "입력 필요",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-progress-prediction', {
        body: { currentProgress, studyPattern, targetCompletion }
      });

      if (error) throw error;
      setResult(data.prediction);
      
      toast({
        title: "분석 완료",
        description: "AI가 진도를 분석했습니다.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "오류 발생",
        description: "분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg sm:max-w-2xl max-sm:h-screen max-sm:max-h-screen max-sm:w-screen max-sm:rounded-none max-sm:m-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span>AI 진도 예측</span>
              <span className="text-xs bg-gradient-to-r from-primary to-accent text-white px-2 py-0.5 rounded-full font-bold">AI</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <AITokenNotice />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="progress">현재 진도 (%)</Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={currentProgress}
              onChange={(e) => setCurrentProgress(e.target.value)}
              placeholder="예: 35"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pattern">학습 패턴</Label>
            <Textarea
              id="pattern"
              value={studyPattern}
              onChange={(e) => setStudyPattern(e.target.value)}
              placeholder="예: 주 3회, 하루 2시간씩 학습"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">목표 완료일</Label>
            <Input
              id="target"
              type="date"
              value={targetCompletion}
              onChange={(e) => setTargetCompletion(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                분석 중...
              </>
            ) : (
              "진도 분석"
            )}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">예측 결과</h3>
              <div className="whitespace-pre-wrap text-sm">{result}</div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
