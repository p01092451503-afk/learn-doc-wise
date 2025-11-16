import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageCircle, FileText, HelpCircle } from "lucide-react";
import { formatAIResponse } from "@/lib/utils";

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
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            AI 튜터
            <Badge variant="default" className="text-xs">AI</Badge>
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
              {(() => {
                try {
                  const parsed = JSON.parse(result);
                  if (parsed.questions && Array.isArray(parsed.questions)) {
                    return (
                      <div className="space-y-6">
                        {parsed.questions.map((q: any, idx: number) => (
                          <div key={idx} className="space-y-3 pb-6 border-b last:border-b-0">
                            <div className="font-semibold text-base">
                              문제 {idx + 1}. {q.question}
                            </div>
                            <div className="space-y-2">
                              {q.options?.map((opt: string, optIdx: number) => (
                                <div 
                                  key={optIdx} 
                                  className={`pl-4 py-2 rounded ${
                                    optIdx === q.answer 
                                      ? 'bg-primary/10 font-medium' 
                                      : 'bg-muted/50'
                                  }`}
                                >
                                  {optIdx + 1}. {opt}
                                </div>
                              ))}
                            </div>
                            {q.explanation && (
                              <div className="mt-3 p-3 bg-muted/30 rounded text-sm">
                                <span className="font-medium">해설: </span>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  }
                } catch (e) {
                  // JSON이 아니면 일반 텍스트로 처리
                }
                return (
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {formatAIResponse(result)}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};
