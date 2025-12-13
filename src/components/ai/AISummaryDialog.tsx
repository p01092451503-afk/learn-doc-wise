import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText } from "lucide-react";
import { AITokenNotice } from "./AITokenNotice";

interface AISummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AISummaryDialog = ({ open, onOpenChange }: AISummaryDialogProps) => {
  const [content, setContent] = useState("");
  const [summaryLength, setSummaryLength] = useState("medium");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) {
      toast({
        title: "입력 필요",
        description: "요약할 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-summarize', {
        body: { content, summaryLength }
      });

      if (error) throw error;
      setResult(data.summary);
      
      toast({
        title: "요약 완료",
        description: "AI가 내용을 요약했습니다.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "오류 발생",
        description: "요약 중 오류가 발생했습니다.",
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
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span>AI 요약</span>
              <span className="text-xs bg-gradient-to-r from-primary to-accent text-white px-2 py-0.5 rounded-full font-bold">AI</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <AITokenNotice />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">요약할 내용</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="긴 텍스트나 강의 내용을 붙여넣으세요..."
              rows={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="length">요약 길이</Label>
            <Select value={summaryLength} onValueChange={setSummaryLength}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">짧게 (3-5문장)</SelectItem>
                <SelectItem value="medium">중간 (한 단락)</SelectItem>
                <SelectItem value="long">길게 (여러 단락)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                요약 중...
              </>
            ) : (
              "요약하기"
            )}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">요약 결과</h3>
              <div className="whitespace-pre-wrap text-sm">{result}</div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
