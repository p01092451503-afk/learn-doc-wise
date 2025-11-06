import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Clock, User } from 'lucide-react';
import { LiveVideoArea } from '@/components/live/LiveVideoArea';
import { LiveChat } from '@/components/live/LiveChat';
import { format } from 'date-fns';

interface LiveSession {
  id: string;
  title: string;
  description: string;
  status: string;
  instructor_id: string;
  scheduled_at: string;
  started_at: string;
}

const AdminLiveSession = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [instructorName, setInstructorName] = useState('');

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      setSession(data);

      // 강사 이름 가져오기
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', data.instructor_id)
        .single();

      if (profileData) {
        setInstructorName(profileData.full_name);
      }
    } catch (error: any) {
      console.error('Error loading session:', error);
      toast({
        title: '세션 로드 실패',
        description: error.message,
        variant: 'destructive'
      });
      navigate('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = () => {
    navigate('/admin/courses');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">세션을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleLeave}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{session.title}</h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{instructorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(session.scheduled_at), 'yyyy-MM-dd HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Badge variant={session.status === 'live' ? 'default' : 'secondary'}>
              {session.status === 'live' ? '라이브' : session.status === 'scheduled' ? '예정' : '종료'}
            </Badge>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          {/* 비디오 영역 (2/3) */}
          <div className="lg:col-span-2 h-full">
            <LiveVideoArea sessionId={session.id} isInstructor={false} />
          </div>

          {/* 채팅 영역 (1/3) */}
          <div className="h-full">
            <LiveChat sessionId={session.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveSession;
