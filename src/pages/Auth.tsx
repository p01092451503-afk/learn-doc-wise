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
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setLoginEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    // Check if coming from demo mode
    const urlParams = new URLSearchParams(window.location.search);
    const fromDemo = urlParams.get('from') === 'demo';

    // Check if user is already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // If from demo, always return to demo
        if (fromDemo) {
          navigate("/demo");
          return;
        }

        // Check user role and redirect accordingly
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .limit(1)
          .maybeSingle();

        if (roles) {
          switch (roles.role) {
            case 'admin':
              navigate("/admin");
              break;
            case 'teacher':
              navigate("/teacher");
              break;
            case 'student':
            default:
              navigate("/student");
              break;
          }
        } else {
          // Default to student if no role found
          navigate("/student");
        }
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // If from demo, always return to demo
        if (fromDemo) {
          navigate("/demo");
          return;
        }

        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .limit(1)
          .maybeSingle();

        if (roles) {
          switch (roles.role) {
            case 'admin':
              navigate("/admin");
              break;
            case 'teacher':
              navigate("/teacher");
              break;
            case 'student':
            default:
              navigate("/student");
              break;
          }
        } else {
          navigate("/student");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const emailValidation = emailSchema.safeParse(loginEmail);
    const passwordValidation = passwordSchema.safeParse(loginPassword);

    if (!emailValidation.success) {
      toast({
        title: "입력 오류",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!passwordValidation.success) {
      toast({
        title: "입력 오류",
        description: passwordValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "로그인 실패",
            description: "이메일 또는 비밀번호가 올바르지 않습니다.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "로그인 실패",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", loginEmail);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        toast({
          title: "로그인 성공",
          description: "환영합니다!",
        });
        
        // Role-based redirect will be handled by useEffect
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "로그인 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const emailValidation = emailSchema.safeParse(signupEmail);
    const passwordValidation = passwordSchema.safeParse(signupPassword);

    if (!emailValidation.success) {
      toast({
        title: "입력 오류",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!passwordValidation.success) {
      toast({
        title: "입력 오류",
        description: passwordValidation.error.errors[0].message,
        variant: "destructive",
      });
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

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: signupName,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "회원가입 실패",
            description: "이미 가입된 이메일입니다.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "회원가입 실패",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "회원가입 성공",
          description: "가입이 완료되었습니다. 로그인해주세요.",
        });
        // Clear signup form
        setSignupName("");
        setSignupEmail("");
        setSignupPassword("");
        setSignupConfirm("");
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "회원가입 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = emailSchema.safeParse(resetEmail);
    if (!emailValidation.success) {
      toast({
        title: "입력 오류",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          title: "오류 발생",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "이메일 전송 완료",
          description: "비밀번호 재설정 링크를 이메일로 전송했습니다.",
        });
        setIsResetDialogOpen(false);
        setResetEmail("");
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "비밀번호 재설정 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleFindId = () => {
    toast({
      title: "아이디 찾기",
      description: "가입 시 사용한 이메일 주소가 아이디입니다. 기억나지 않으시면 관리자에게 문의해주세요.",
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "로그인 실패",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "Google 로그인 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--gradient-hero)] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center mb-8 gap-2">
          <img src={logoIcon} alt="Logo" className="h-12 w-12 animate-nod" />
          <span className="text-2xl font-logo font-bold text-gradient tracking-tight">atomLMS</span>
          <span className="px-2.5 py-1 rounded-full bg-gradient-to-br from-primary via-primary-glow to-accent text-primary-foreground text-xs font-bold shadow-glow border border-primary/20">
            AI
          </span>
        </Link>

        <Card className="shadow-elegant border-border/50 backdrop-blur-sm">
          <CardHeader className="space-y-3">
            <CardTitle className="text-center">환영합니다</CardTitle>
            <CardDescription className="text-center text-base">계정에 로그인하거나 새로 가입하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">로그인</TabsTrigger>
                <TabsTrigger value="signup">회원가입</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">비밀번호</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
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
                        아이디 기억하기
                      </label>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <button
                        type="button"
                        onClick={handleFindId}
                        className="text-primary hover:underline"
                      >
                        아이디 찾기
                      </button>
                      <span className="text-muted-foreground">|</span>
                      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="text-primary hover:underline"
                          >
                            비밀번호 찾기
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>비밀번호 재설정</DialogTitle>
                            <DialogDescription>
                              가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handlePasswordReset} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="reset-email">이메일</Label>
                              <Input
                                id="reset-email"
                                type="email"
                                placeholder="your@email.com"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full" disabled={isResetLoading}>
                              {isResetLoading ? "전송 중..." : "재설정 링크 보내기"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading} variant="premium">
                    {isLoading ? "로그인 중..." : "로그인"}
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">또는</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      type="button"
                      onClick={handleGoogleSignIn}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google로 계속하기
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">이름</Label>
                    <Input
                      id="signup-name"
                      placeholder="홍길동"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">이메일</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">비밀번호</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">비밀번호 확인</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading} variant="premium">
                    {isLoading ? "가입 중..." : "회원가입"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          계속 진행하면{" "}
          <a href="#" className="underline">
            서비스 약관
          </a>{" "}
          및{" "}
          <a href="#" className="underline">
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
};

export default Auth;
