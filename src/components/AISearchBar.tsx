import { useState, useRef, useEffect } from "react";
import { Search, Loader2, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { formatAIResponse } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AISearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatbot`;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);
    setIsOpen(true);

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userRole: "user",
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("검색에 실패했습니다.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                assistantMessage += content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === "assistant") {
                    lastMessage.content = assistantMessage;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "오류",
        description: "검색 중 문제가 발생했습니다.",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessages([]);
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative shadow-lg">
        <Badge variant="default" className="absolute -top-2 left-2 z-10 text-[10px] px-1.5 py-0.5 h-auto">
          AI
        </Badge>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/70" />
        <Input
          type="text"
          placeholder="AI 어시스턴트에게 질문하세요 (강좌, 콘텐츠, CS 문의 등)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => messages.length > 0 && setIsOpen(true)}
          className="pl-12 pr-14 h-14 text-base bg-background border-2 border-primary/20 hover:border-primary/40 focus:border-primary shadow-md transition-all placeholder:text-muted-foreground/70 font-medium"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-primary/10"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Sparkles className="h-5 w-5 text-primary" />
          )}
        </Button>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && messages.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={handleClose}
          />
          <Card className="absolute top-full mt-2 w-full z-50 max-h-[500px] shadow-2xl border-2 border-primary/20 bg-background">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">AI 어시스턴트</h3>
                <Badge variant="default" className="text-xs">AI</Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[400px]" ref={scrollRef}>
              <div className="p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {msg.role === "assistant" ? formatAIResponse(msg.content) : msg.content}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </>
      )}
    </div>
  );
};
