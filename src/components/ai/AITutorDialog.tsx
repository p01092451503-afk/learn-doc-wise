import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MessageCircle, FileText, HelpCircle } from "lucide-react";

interface AITutorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseContext?: string;
}

export const AITutorDialog = ({ open, onOpenChange, courseContext }: AITutorDialogProps) => {
  const [question, setQuestion] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const { toast } = useToast();

  const handleAIAction = async (action: "answer" | "summarize" | "quiz") => {
    const inputContent = action === "answer" ? question : content;
    
    if (!inputContent.trim()) {
      toast({
        title: "입력 필요",
        description: "내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: {
          action,
          content: inputContent,
          context: courseContext,
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

      setResult(data.result);
    } catch (error) {
      console.error("AI Tutor error:", error);
      toast({
        title: "오류",
        description: "AI 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            AI 튜터
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="question" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="question">
              <HelpCircle className="h-4 w-4 mr-2" />
              질문하기
            </TabsTrigger>
            <TabsTrigger value="summarize">
              <FileText className="h-4 w-4 mr-2" />
              요약하기
            </TabsTrigger>
            <TabsTrigger value="quiz">
              <FileText className="h-4 w-4 mr-2" />
              문제 출제
            </TabsTrigger>
          </TabsList>

          <TabsContent value="question" className="space-y-4">
            <Textarea
              placeholder="궁금한 점을 질문해주세요..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
            />
            <Button 
              onClick={() => handleAIAction("answer")}
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              AI에게 질문하기
            </Button>
          </TabsContent>

          <TabsContent value="summarize" className="space-y-4">
            <Textarea
              placeholder="요약할 내용을 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
            <Button 
              onClick={() => handleAIAction("summarize")}
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              요약하기
            </Button>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4">
            <Textarea
              placeholder="문제를 출제할 학습 내용을 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
            <Button 
              onClick={() => handleAIAction("quiz")}
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              문제 출제하기
            </Button>
          </TabsContent>
        </Tabs>

        {result && (
          <Card className="mt-4">
            <CardContent className="pt-4">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans">{result}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};
