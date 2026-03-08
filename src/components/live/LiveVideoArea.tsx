import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Users,
  Loader2
} from 'lucide-react';

interface LiveVideoAreaProps {
  sessionId: string;
  isInstructor?: boolean;
}

interface Participant {
  id: string;
  user_id: string;
  is_online: boolean;
  joined_at: string;
  user_name?: string;
}

export const LiveVideoArea = ({ sessionId, isInstructor = false }: LiveVideoAreaProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId || !user) return;

    // 참여자로 등록
    joinSession();

    // 참여자 목록 로드
    loadParticipants();

    // 실시간 참여자 업데이트 구독
    const channel = supabase
      .channel(`live-participants-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_participants',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          loadParticipants();
        }
      )
      .subscribe();

    // 나갈 때 상태 업데이트
    return () => {
      leaveSession();
      supabase.removeChannel(channel);
    };
  }, [sessionId, user]);

  const joinSession = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('live_participants')
        .upsert({
          session_id: sessionId,
          user_id: user.id,
          is_online: true
        }, {
          onConflict: 'session_id,user_id'
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error joining session:', error);
      toast.error('세션 참여 중 오류가 발생했습니다.');
    }
  };

  const leaveSession = async () => {
    if (!user) return;

    try {
      await supabase
        .from('live_participants')
        .update({
          is_online: false,
          left_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);
    } catch (error: any) {
      console.error('Error leaving session:', error);
      toast.error('세션 종료 중 오류가 발생했습니다.');
    }
  };

  const loadParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('live_participants')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_online', true)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      // 사용자 이름 가져오기
      const participantsWithNames = await Promise.all(
        (data || []).map(async (p) => ({
          ...p,
          user_name: await getUserName(p.user_id)
        }))
      );

      setParticipants(participantsWithNames);
    } catch (error: any) {
      console.error('Error loading participants:', error);
      toast.error('참가자 목록을 불러오는 데 실패했습니다.');
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? '마이크 켜짐' : '마이크 꺼짐',
      description: isMuted ? '마이크가 활성화되었습니다' : '마이크가 음소거되었습니다'
    });
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast({
      title: isVideoOff ? '비디오 켜짐' : '비디오 꺼짐',
      description: isVideoOff ? '비디오가 활성화되었습니다' : '비디오가 비활성화되었습니다'
    });
  };

  const toggleScreenShare = () => {
    if (!isInstructor) {
      toast({
        title: '권한 없음',
        description: '화면 공유는 강사만 가능합니다',
        variant: 'destructive'
      });
      return;
    }

    setIsSharing(!isSharing);
    toast({
      title: isSharing ? '화면 공유 중지' : '화면 공유 시작',
      description: isSharing ? '화면 공유가 중지되었습니다' : '화면 공유가 시작되었습니다'
    });
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border">
      {/* 메인 비디오 영역 */}
      <div className="relative flex-1 bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {isSharing ? '화면 공유 중' : '비디오 영역'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              실제 WebRTC 비디오 기능은 추후 구현될 예정입니다
            </p>
          </div>
        </div>

        {/* 참여자 수 표시 */}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{participants.length}명 참여 중</span>
          </Badge>
        </div>
      </div>

      {/* 하단 참여자 목록 */}
      <div className="p-4 border-t">
        <ScrollArea className="h-24">
          <div className="flex gap-3">
            {loading ? (
              <div className="flex items-center justify-center w-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">참여자가 없습니다</p>
            ) : (
              participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex flex-col items-center gap-1"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {participant.user_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs truncate max-w-[60px]">
                    {participant.user_name}
                  </span>
                  {participant.user_id === user?.id && (
                    <Badge variant="outline" className="text-xs">나</Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="p-4 border-t flex justify-center gap-2">
        <Button
          variant={isMuted ? 'destructive' : 'default'}
          size="icon"
          onClick={toggleMute}
        >
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        <Button
          variant={isVideoOff ? 'destructive' : 'default'}
          size="icon"
          onClick={toggleVideo}
        >
          {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </Button>

        {isInstructor && (
          <Button
            variant={isSharing ? 'default' : 'outline'}
            size="icon"
            onClick={toggleScreenShare}
          >
            {isSharing ? <Monitor className="h-4 w-4" /> : <MonitorOff className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
};
