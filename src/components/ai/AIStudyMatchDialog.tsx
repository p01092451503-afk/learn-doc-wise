import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users } from "lucide-react";

interface AIStudyMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AIStudyMatchDialog = ({ open, onOpenChange }: AIStudyMatchDialogProps) => {
  const [level, setLevel] = useState("");
  const [interests, setInterests] = useState("");
  const [availability, setAvailability] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!level || !interests || !availability) {
      toast({
        title: "입력 필요",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userProfile = { level, interests };
      const preferences = { availability };

      const { data, error } = await supabase.functions.invoke('ai-study-match', {
        body: { userProfile, preferences }
      });

      if (error) throw error;
      setResult(data.recommendation);
      
      toast({
        title: "매칭 완료",
        description: "스터디 메이트 추천을 생성했습니다.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "오류 발생",
        description: "매칭 중 오류가 발생했습니다.",
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
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span>AI 스터디 메이트 매칭</span>
              <span className="text-xs bg-gradient-to-r from-primary to-accent text-white px-2 py-0.5 rounded-full font-bold">AI</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="level">나의 수준</Label>
            <Input
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="예: 중급"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">관심 분야</Label>
            <Input
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="예: 웹 개발, React, TypeScript"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">가능한 시간대</Label>
            <Textarea
              id="availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="예: 주중 저녁 7-9시, 주말 오후"
              rows={2}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                매칭 중...
              </>
            ) : (
              "스터디 메이트 찾기"
            )}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">추천 결과</h3>
              <div className="whitespace-pre-wrap text-sm">{result}</div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
