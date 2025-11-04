import { useState, useEffect } from "react";
import OperatorLayout from "@/components/layouts/OperatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, UserCheck, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DemoRequest {
  user_id: string;
  email: string;
  demo_requested_at: string;
  demo_approved: boolean;
}

const OperatorDemoApproval = () => {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("pending");
  const { toast } = useToast();
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("operator-theme");
    return (saved as "dark" | "light") || "light";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("operator-theme");
      setTheme((saved as "dark" | "light") || "light");
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const saved = localStorage.getItem("operator-theme");
      if (saved !== theme) {
        setTheme((saved as "dark" | "light") || "light");
      }
    }, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, email, demo_requested_at, demo_approved")
        .not("demo_requested_at", "is", null)
        .order("demo_requested_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "데모 신청 목록을 불러올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from("profiles")
        .update({
          demo_approved: true,
          demo_approved_at: new Date().toISOString(),
          demo_approved_by: session?.user.id,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "승인 완료",
        description: "데모 접근이 승인되었습니다.",
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "승인 처리에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          demo_approved: false,
          demo_requested_at: null,
          demo_approved_at: null,
          demo_approved_by: null,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "거부 완료",
        description: "데모 신청이 거부되었습니다.",
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "거부 처리에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && !req.demo_approved) ||
      (statusFilter === "approved" && req.demo_approved);
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter((r) => !r.demo_approved).length;
  const approvedCount = requests.filter((r) => r.demo_approved).length;

  return (
    <OperatorLayout>
      <div className="space-y-6">
        <div>
          <h1 className={cn(
            "text-3xl font-bold mb-2 flex items-center gap-3 transition-colors",
            theme === "dark" ? "text-white" : "text-slate-900"
          )}>
            <UserCheck className="h-8 w-8 text-violet-500" />
            데모 승인 관리
          </h1>
          <p className={cn(
            "transition-colors",
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          )}>
            사용자의 데모 접근 신청을 관리합니다
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={cn(
            "transition-colors",
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className={cn(
                "text-sm font-medium transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>
                전체 신청
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>
                {requests.length}
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-colors",
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className={cn(
                "text-sm font-medium transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>
                승인 대기
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {pendingCount}
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-colors",
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className={cn(
                "text-sm font-medium transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>
                승인 완료
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {approvedCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className={cn(
          "transition-colors",
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
        )}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                )} />
                <Input
                  placeholder="이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "pl-9 transition-colors",
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className={cn(
                  "w-full md:w-48 transition-colors",
                  theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                )}>
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent className={cn(
                  "transition-colors",
                  theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                )}>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">승인 대기</SelectItem>
                  <SelectItem value="approved">승인 완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card className={cn(
          "transition-colors",
          theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-300"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "transition-colors",
              theme === "dark" ? "text-white" : "text-slate-900"
            )}>
              데모 신청 목록
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className={cn(
                "text-center py-8 transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>
                로딩 중...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className={cn(
                "text-center py-8 transition-colors",
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              )}>
                {searchTerm || statusFilter !== "all"
                  ? "검색 결과가 없습니다."
                  : "데모 신청이 없습니다."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((request) => (
                  <div
                    key={request.user_id}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      theme === "dark" ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-300"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={cn(
                            "font-medium truncate transition-colors",
                            theme === "dark" ? "text-white" : "text-slate-900"
                          )}>
                            {request.email}
                          </p>
                          {request.demo_approved ? (
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/50">
                              승인됨
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/50">
                              <Clock className="h-3 w-3 mr-1" />
                              대기중
                            </Badge>
                          )}
                        </div>
                        <p className={cn(
                          "text-sm transition-colors",
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        )}>
                          신청일: {new Date(request.demo_requested_at).toLocaleString("ko-KR")}
                        </p>
                      </div>
                      {!request.demo_approved && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.user_id)}
                            className="gap-2 bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4" />
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request.user_id)}
                            className={cn(
                              "gap-2 transition-colors",
                              theme === "dark"
                                ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                                : "border-red-300 text-red-600 hover:bg-red-50"
                            )}
                          >
                            <XCircle className="h-4 w-4" />
                            거부
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OperatorLayout>
  );
};

export default OperatorDemoApproval;
