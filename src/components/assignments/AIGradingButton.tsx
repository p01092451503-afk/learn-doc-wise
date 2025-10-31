import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatAIResponse } from "@/lib/utils";

interface AIGradingButtonProps {
  submissionId: string;
  submissionText: string;
  maxScore?: number;
  onGradingComplete?: () => void;
}

export const AIGradingButton = ({ 
  submissionId, 
  submissionText, 
  maxScore = 100,
  onGradingComplete 
}: AIGradingButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [rubric, setRubric] = useState(`- 내용의 정확성 (40%)
- 논리적 구성 (30%)
- 창의성 및 독창성 (20%)
- 작성 품질 (10%)`);
  const { toast } = useToast();

  const handleAIGrading = async () => {
    setIsGrading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("로그인이 필요합니다");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-grading`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            submissionId,
            submissionText,
            maxScore,
            rubric,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "AI 채점에 실패했습니다");
      }

      const { result } = await response.json();

      toast({
        title: "AI 채점 완료",
        description: `점수: ${result.score}/${maxScore}점`,
      });

      setIsOpen(false);
      if (onGradingComplete) onGradingComplete();
    } catch (error) {
      console.error("AI 채점 오류:", error);
      toast({
        title: "채점 실패",
        description: error instanceof Error ? error.message : "AI 채점 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <Badge variant="default" className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 h-auto">
            AI
          </Badge>
          <Sparkles className="h-4 w-4" />
          AI 자동 채점
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            AI 자동 채점
            <Badge variant="default" className="text-xs">AI</Badge>
          </DialogTitle>
          <DialogDescription>
            AI가 과제를 분석하여 자동으로 채점하고 피드백을 제공합니다
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>제출 내용</Label>
            <Textarea
              value={submissionText}
              disabled
              rows={6}
              className="mt-2 bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="rubric">채점 기준 (선택사항)</Label>
            <Textarea
              id="rubric"
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              rows={6}
              className="mt-2"
              placeholder="채점 기준을 입력하세요..."
            />
            <p className="text-sm text-muted-foreground mt-1">
              기본 채점 기준이 적용되어 있습니다. 수정하여 사용하실 수 있습니다.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isGrading}
            >
              취소
            </Button>
            <Button
              onClick={handleAIGrading}
              disabled={isGrading || !submissionText.trim()}
              className="gap-2"
            >
              {isGrading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  채점 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI 채점 시작
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};