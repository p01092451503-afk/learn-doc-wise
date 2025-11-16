import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Languages } from "lucide-react";
import { formatAIResponse } from "@/lib/utils";

interface AITranslateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AITranslateDialog = ({ open, onOpenChange }: AITranslateDialogProps) => {
  const [text, setText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [sourceLanguage, setSourceLanguage] = useState("ko");
  const [loading, setLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>("");
  const { toast } = useToast();

  const languages = [
    { value: "ko", label: "한국어" },
    { value: "en", label: "영어" },
    { value: "ja", label: "일본어" },
    { value: "zh", label: "중국어" },
    { value: "es", label: "스페인어" },
    { value: "fr", label: "프랑스어" },
    { value: "de", label: "독일어" },
  ];

  const handleTranslate = async () => {
    if (!text.trim()) {
      toast({
        title: "입력 필요",
        description: "번역할 텍스트를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (sourceLanguage === targetLanguage) {
      toast({
        title: "언어 선택 오류",
        description: "원문과 번역 언어가 같습니다.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setTranslatedText("");

    try {
      const { data, error } = await supabase.functions.invoke("ai-translate", {
        body: {
          text,
          targetLanguage,
          sourceLanguage,
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

      setTranslatedText(data.translatedText);
      toast({
        title: "번역 완료",
        description: "텍스트가 번역되었습니다.",
      });
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "오류",
        description: "번역 중 오류가 발생했습니다.",
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
            <Languages className="h-5 w-5" />
            AI 번역
            <Badge variant="default" className="text-xs">AI</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>원문 언어</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>번역할 언어</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>원문</Label>
            <Textarea
              placeholder="번역할 텍스트를 입력하세요..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
            />
          </div>

          <Button 
            onClick={handleTranslate}
            disabled={loading}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            번역하기
          </Button>

          {translatedText && (
            <Card>
              <CardContent className="pt-4">
                <Label className="mb-2 block">번역 결과</Label>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed bg-muted p-4 rounded-lg">
                    {formatAIResponse(translatedText)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
