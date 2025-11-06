import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface LiveChatProps {
  sessionId: string;
}

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  user_name?: string;
}

export const LiveChat = ({ sessionId }: LiveChatProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) return;

    // 기존 메시지 로드
    loadMessages();

    // 실시간 구독
    const channel = supabase
      .channel(`live-chat-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          const userName = await getUserName(newMsg.user_id);
          setMessages(prev => [...prev, { ...newMsg, user_name: userName }]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // 사용자 이름 가져오기
      const messagesWithNames = await Promise.all(
        (data || []).map(async (msg) => ({
          ...msg,
          user_name: await getUserName(msg.user_id)
        }))
      );

      setMessages(messagesWithNames);
      setTimeout(scrollToBottom, 100);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast({
        title: '메시지 로드 실패',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserName = async (userId: string): Promise<string> => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', userId)
        .single();
      
      return data?.full_name || '익명';
    } catch {
      return '익명';
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('live_chat_messages')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: '메시지 전송 실패',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-semibold">실시간 채팅</h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            아직 메시지가 없습니다
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.user_id === user?.id ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {msg.user_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex flex-col gap-1 max-w-[70%] ${
                    msg.user_id === user?.id ? 'items-end' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{msg.user_name}</span>
                    <span>{format(new Date(msg.created_at), 'HH:mm')}</span>
                  </div>
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      msg.user_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            disabled={sending}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
