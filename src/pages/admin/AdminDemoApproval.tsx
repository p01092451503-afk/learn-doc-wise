import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, User, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const AdminDemoApproval = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  // Fetch demo requests
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["demo-requests", filter],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .not("demo_requested_at", "is", null)
        .order("demo_requested_at", { ascending: false });

      if (filter === "pending") {
        query = query.eq("demo_approved", false);
      } else if (filter === "approved") {
        query = query.eq("demo_approved", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Approve demo request
  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          demo_approved: true,
          demo_approved_at: new Date().toISOString(),
          demo_approved_by: user.id,
        })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demo-requests"] });
      toast({
        title: "승인 완료",
        description: "데모 접근이 승인되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "승인 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject demo request
  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demo-requests"] });
      toast({
        title: "거부 완료",
        description: "데모 요청이 거부되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "거부 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">데모 승인 관리</h1>
          <p className="text-muted-foreground">데모 체험 신청을 승인하거나 거부합니다</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            <Clock className="h-4 w-4 mr-2" />
            대기 중
          </Button>
          <Button
            variant={filter === "approved" ? "default" : "outline"}
            onClick={() => setFilter("approved")}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            승인됨
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            전체
          </Button>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : !profiles || profiles.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">데모 요청이 없습니다.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {profiles.map((profile: any) => (
              <Card key={profile.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {profile.full_name || "이름 없음"}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>User ID: {profile.user_id.substring(0, 8)}...</span>
                        </div>
                      </div>
                      {profile.demo_approved ? (
                        <Badge variant="default" className="ml-auto">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          승인됨
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="ml-auto">
                          <Clock className="h-3 w-3 mr-1" />
                          대기 중
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">요청 일시</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground">
                            {profile.demo_requested_at
                              ? format(new Date(profile.demo_requested_at), "PPP p", { locale: ko })
                              : "-"}
                          </span>
                        </div>
                      </div>

                      {profile.demo_approved && profile.demo_approved_at && (
                        <div>
                          <p className="text-muted-foreground mb-1">승인 일시</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-foreground">
                              {format(new Date(profile.demo_approved_at), "PPP p", { locale: ko })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {!profile.demo_approved && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => approveMutation.mutate(profile.user_id)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectMutation.mutate(profile.user_id)}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        거부
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDemoApproval;
