import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface ChatMessage {
  id: string;
  course_id: string;
  user_id: string;
  message: string;
  user_role: 'student' | 'teacher' | 'admin';
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface CourseChatRoomProps {
  courseId: string;
}

export const CourseChatRoom = ({ courseId }: CourseChatRoomProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCurrentUser();
    loadMessages();
    subscribeToMessages();
  }, [courseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      
      // 사용자 역할 가져오기
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (roleData) {
        setCurrentUserRole(roleData.role as 'student' | 'teacher' | 'admin');
      }
    }
  };

  const loadMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from('course_chat_messages')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // 사용자 프로필 정보 가져오기
      if (messagesData && messagesData.length > 0) {
        const userIds = [...new Set(messagesData.map(m => m.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);

        const profilesMap = new Map(
          profilesData?.map(p => [p.user_id, p]) || []
        );

        const messagesWithProfiles = messagesData.map(msg => ({
          ...msg,
          profiles: profilesMap.get(msg.user_id) || null
        })) as ChatMessage[];

        setMessages(messagesWithProfiles);
      } else {
        setMessages([]);
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast.error('메시지를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`course-chat-${courseId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'course_chat_messages',
          filter: `course_id=eq.${courseId}`
        },
        async (payload) => {
          // 프로필 정보와 함께 메시지 로드
          const { data: msgData } = await supabase
            .from('course_chat_messages')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (msgData) {
            // 프로필 정보 가져오기
            const { data: profileData } = await supabase
              .from('profiles')
              .select('user_id, full_name, avatar_url')
              .eq('user_id', msgData.user_id)
              .single();

            const messageWithProfile: ChatMessage = {
              ...msgData,
              user_role: msgData.user_role as 'student' | 'teacher' | 'admin',
              profiles: profileData || null
            };

            setMessages(prev => [...prev, messageWithProfile]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('course_chat_messages')
        .insert({
          course_id: courseId,
          user_id: currentUser.id,
          message: newMessage.trim(),
          user_role: currentUserRole
        });

      if (error) throw error;
      
      setNewMessage("");
      toast.success('메시지를 전송했습니다');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('메시지 전송에 실패했습니다');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'teacher':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'teacher':
        return '강사';
      case 'admin':
        return '관리자';
      default:
        return '학생';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">채팅을 불러오는 중...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">실시간 Q&A</h3>
          <Badge variant="secondary" className="ml-auto">
            {messages.length}개 메시지
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
              <p>아직 메시지가 없습니다</p>
              <p className="text-sm">첫 메시지를 남겨보세요!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.user_id === currentUser?.id;
              const userName = msg.profiles?.full_name || '익명';
              const avatarUrl = msg.profiles?.avatar_url;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback>{userName[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{userName}</span>
                      <Badge variant={getRoleBadgeVariant(msg.user_role)} className="text-xs">
                        {getRoleLabel(msg.user_role)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.created_at), 'HH:mm', { locale: ko })}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="메시지를 입력하세요... (Shift+Enter: 줄바꿈)"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[60px] resize-none"
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Enter로 전송, Shift+Enter로 줄바꿈
        </p>
      </div>
    </Card>
  );
};