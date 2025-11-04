import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, CheckCircle, Loader2 } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";

const Main2 = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signupLoading, setSignupLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setSignupLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create profile with demo request
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: data.user.id,
            full_name: fullName,
            demo_approved: false,
            demo_requested_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;

        toast({
          title: "회원가입 완료",
          description: "운영자 승인 후 데모 페이지에 접근할 수 있습니다.",
        });

        setEmail("");
        setPassword("");
        setFullName("");
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSignupLoading(false);
    }
  };

  const handleDemoAccess = () => {
    if (profile?.demo_approved) {
      navigate("/demo");
    } else {
      toast({
        title: "접근 불가",
        description: "운영자 승인 대기 중입니다.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "로그아웃",
      description: "로그아웃되었습니다.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-background/95 backdrop-blur-xl z-50 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoIcon} alt="Atom LMS 로고" className="h-12 w-12" width="48" height="48" />
            <span className="text-2xl font-logo font-bold text-foreground tracking-tight">atomLMS</span>
          </Link>
          <div className="flex items-center gap-3">
            {session ? (
              <Button variant="ghost" onClick={handleLogout}>
                로그아웃
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="ghost">로그인</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Hero Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">데모 체험 플랫폼</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-foreground leading-tight">
                  AI 학습관리시스템
                  <br />
                  <span className="text-gradient">데모 체험하기</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  회원가입 후 운영자 승인을 받으면 모든 기능을 체험할 수 있습니다.
                  실제 환경에서 atomLMS의 강력한 기능들을 직접 경험해보세요.
                </p>

                {session && profile && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {profile.full_name?.[0] || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{profile.full_name}</p>
                        <p className="text-sm text-muted-foreground">{session.user.email}</p>
                      </div>
                    </div>

                    {profile.demo_approved ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-semibold">승인 완료! 데모를 체험할 수 있습니다.</span>
                        </div>
                        <Button
                          size="lg"
                          variant="premium"
                          className="w-full"
                          onClick={handleDemoAccess}
                        >
                          데모 페이지로 이동
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            ⏳ 운영자 승인 대기 중입니다. 승인 후 데모 페이지에 접근할 수 있습니다.
                          </p>
                        </div>
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full"
                          disabled
                        >
                          승인 대기 중
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Signup Form */}
              {!session && (
                <Card className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">데모 체험 신청</h2>
                    <p className="text-muted-foreground">
                      회원가입 후 운영자 승인을 받아 데모를 체험하세요
                    </p>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">이름</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="홍길동"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">이메일</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">비밀번호</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      variant="premium"
                      disabled={signupLoading}
                    >
                      {signupLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          처리 중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          데모 체험 신청하기
                        </>
                      )}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                      이미 계정이 있으신가요?{" "}
                      <Link to="/auth" className="text-primary hover:underline">
                        로그인
                      </Link>
                    </div>
                  </form>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              데모에서 체험할 수 있는 <span className="text-gradient">주요 기능</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              실제 학습 환경과 동일한 모든 기능을 체험해보세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              title="AI 튜터"
              description="24시간 학습 지원 AI 튜터와 대화하며 궁금한 점을 해결하세요"
            />
            <FeatureCard
              title="실시간 대시보드"
              description="학습 진도와 성취도를 실시간으로 확인하고 분석하세요"
            />
            <FeatureCard
              title="과제 및 퀴즈"
              description="AI 자동 채점과 피드백으로 효율적인 학습을 경험하세요"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <Card className="p-6 hover:shadow-premium transition-all duration-300 hover:-translate-y-1">
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </Card>
  );
};

export default Main2;
