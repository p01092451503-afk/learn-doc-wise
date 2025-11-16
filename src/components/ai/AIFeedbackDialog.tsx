import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, FileCheck, SpellCheck } from "lucide-react";
import { formatAIResponse } from "@/lib/utils";

interface AIFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AIFeedbackDialog = ({ open, onOpenChange }: AIFeedbackDialogProps) => {
  const [content, setContent] = useState("");
  const [criteria, setCriteria] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const { toast } = useToast();

  const handleFeedback = async (type: "assignment" | "grammar") => {
    if (!content.trim()) {
      toast({
        title: "입력 필요",
        description: "내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setFeedback("");

    try {
      const { data, error } = await supabase.functions.invoke("ai-feedback", {
        body: {
          type,
          content,
          criteria: type === "assignment" ? criteria : undefined,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "오류",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setFeedback(data.feedback);
      toast({
        title: "완료",
        description: "AI 피드백이 생성되었습니다.",
      });
    } catch (error) {
      console.error("AI Feedback error:", error);
      toast({
        title: "오류",
        description: "피드백 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            AI 피드백
            <Badge variant="default" className="text-xs">AI</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="assignment" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assignment">
              <FileCheck className="h-4 w-4 mr-2" />
              과제 평가
            </TabsTrigger>
            <TabsTrigger value="grammar">
              <SpellCheck className="h-4 w-4 mr-2" />
              문장 교정
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assignment" className="space-y-4">
            <div className="space-y-2">
              <Label>평가 기준 (선택사항)</Label>
              <Input
                placeholder="예: 내용의 완성도, 논리성, 창의성"
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
              />
            </div>
            <Textarea
              placeholder="평가할 과제 내용을 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
            <Button 
              onClick={() => handleFeedback("assignment")}
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              AI 피드백 받기
            </Button>
          </TabsContent>

          <TabsContent value="grammar" className="space-y-4">
            <Textarea
              placeholder="교정할 텍스트를 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
            />
            <Button 
              onClick={() => handleFeedback("grammar")}
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              문장 교정하기
            </Button>
          </TabsContent>
        </Tabs>

        {feedback && (
          <Card className="mt-4">
            <CardContent className="pt-4">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{formatAIResponse(feedback)}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};
