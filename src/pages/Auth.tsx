import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import type { Session, User } from "@supabase/supabase-js";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const emailSchema = z.string().email("유효한 이메일 주소를 입력하세요");
const passwordSchema = z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다");

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setLoginEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // SINGLE auth initialization effect
  useEffect(() => {
    let mounted = true;
    let authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null;

    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing authentication...');
        
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const shouldLogout = urlParams.get('logout') === 'true';
        const fromDemo = urlParams.get('from') === 'demo';
        const fromMain2 = urlParams.get('from') === 'main2';

        // Handle explicit logout request
        if (shouldLogout && mounted) {
          console.log('[Auth] Logout requested, signing out...');
          await supabase.auth.signOut();
          window.history.replaceState({}, '', '/auth');
          setAuthInitialized(true);
          return;
        }

        // Set up auth state listener
        authListener = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (!mounted) return;
          
          console.log('[Auth] Auth event:', event);
          setSession(newSession);
          setUser(newSession?.user ?? null);

          // Only redirect on SIGNED_IN event
          if (event === 'SIGNED_IN' && newSession) {
            await handleRedirect(newSession, fromDemo, fromMain2);
          }
        });

        // Check for existing session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('[Auth] Session error:', error);
          await supabase.auth.signOut({ scope: 'local' });
        }

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setAuthInitialized(true);

          // Redirect if already logged in
          if (currentSession) {
            await handleRedirect(currentSession, fromDemo, fromMain2);
          }
        }
      } catch (error) {
        console.error('[Auth] Initialization error:', error);
        if (mounted) {
          setAuthInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (authListener) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  // Redirect handler
  const handleRedirect = async (session: Session, fromDemo: boolean, fromMain2: boolean) => {
    try {
      // Demo flow
      if (fromDemo) {
        navigate("/demo");
        return;
      }

      // Main2 demo approval flow
      if (fromMain2) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('demo_approved')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profile?.demo_approved) {
          navigate("/demo");
          return;
        }
      }

      // Get user roles
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('[Auth] Error fetching roles:', error);
        navigate("/student");
        return;
      }

      console.log('[Auth] User roles:', userRoles);

      if (userRoles && userRoles.length > 0) {
        const rolesPriority = ['admin', 'operator', 'teacher', 'student'];
        const primaryRole = rolesPriority.find(role => 
          userRoles.some(ur => ur.role === role)
        ) || 'student';

        console.log('[Auth] Redirecting to dashboard:', primaryRole);

        const roleRoutes: Record<string, string> = {
          admin: "/admin",
          operator: "/operator",
          teacher: "/teacher",
          student: "/student"
        };

        navigate(roleRoutes[primaryRole] || "/student");
      } else {
        console.log('[Auth] No roles found, defaulting to student');
        navigate("/student");
      }
    } catch (error) {
      console.error('[Auth] Redirect error:', error);
      navigate("/student");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "입력 오류",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        throw error;
      }

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", loginEmail);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });

      // Redirect will be handled by onAuthStateChange
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      
      let errorMessage = "로그인에 실패했습니다.";
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "로그인 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    try {
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "입력 오류",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return;
    }

    if (signupPassword !== signupConfirm) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (!signupName.trim()) {
      toast({
        title: "이름 입력 필요",
        description: "이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "회원가입 성공",
        description: "이메일 확인 후 로그인해주세요.",
      });

      // Clear form
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirm("");
    } catch (error: any) {
      console.error('[Auth] Signup error:', error);
      
      let errorMessage = "회원가입에 실패했습니다.";
      if (error.message?.includes("already registered")) {
        errorMessage = "이미 등록된 이메일입니다.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "회원가입 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(resetEmail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "입력 오류",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return;
    }

    setIsResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "비밀번호 재설정 이메일 발송",
        description: "이메일을 확인해주세요.",
      });

      setIsResetDialogOpen(false);
      setResetEmail("");
    } catch (error: any) {
      console.error('[Auth] Password reset error:', error);
      toast({
        title: "비밀번호 재설정 실패",
        description: error.message || "비밀번호 재설정에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  // Show nothing while initializing
  if (!authInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/" className="flex items-center gap-2">
                  <img src={logoIcon} alt="Atom LMS 로고" className="h-12 w-12" />
                  <span className="text-2xl font-logo font-bold text-foreground tracking-tight">atomLMS</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-primary text-primary-foreground border-primary">
                <p>아톰 안녕?</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">환영합니다</CardTitle>
              <CardDescription>atomLMS에 로그인하거나 회원가입하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">로그인</TabsTrigger>
                  <TabsTrigger value="signup">회원가입</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">이메일</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">비밀번호</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <label
                          htmlFor="remember"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          이메일 기억하기
                        </label>
                      </div>
                      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="link" className="p-0 h-auto text-sm">
                            비밀번호 찾기
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>비밀번호 재설정</DialogTitle>
                            <DialogDescription>
                              등록된 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handlePasswordReset} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="reset-email">이메일</Label>
                              <Input
                                id="reset-email"
                                type="email"
                                placeholder="이메일을 입력하세요"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                disabled={isResetLoading}
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full" disabled={isResetLoading}>
                              {isResetLoading ? "처리 중..." : "재설정 링크 보내기"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "로그인 중..." : "로그인"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">이름</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="이름을 입력하세요"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">이메일</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">비밀번호</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="비밀번호를 입력하세요 (최소 6자)"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">비밀번호 확인</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="비밀번호를 다시 입력하세요"
                        value={signupConfirm}
                        onChange={(e) => setSignupConfirm(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "처리 중..." : "회원가입"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default Auth;
