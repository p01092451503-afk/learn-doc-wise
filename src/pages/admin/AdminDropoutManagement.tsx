import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Download, Eye, AlertCircle, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const AdminDropoutManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: dropoutRecords = [], isLoading } = useQuery({
    queryKey: ["admin-dropout-records", selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from("dropout_records")
        .select(`
          *,
          enrollment:enrollment_id(
            user_id,
            course:course_id(title),
            student:user_id(full_name, email)
          )
        `)
        .order("dropout_date", { ascending: false });

      if (selectedStatus && selectedStatus !== "all") {
        query = query.eq("refund_status", selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredData = dropoutRecords.filter((item: any) =>
    item.enrollment?.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.enrollment?.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.enrollment?.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      pending: { label: "대기중", variant: "secondary" },
      approved: { label: "승인", variant: "default" },
      rejected: { label: "거부", variant: "destructive" },
      completed: { label: "완료", variant: "outline" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, string> = {
      personal: "개인사정",
      financial: "경제적사유",
      academic: "학업부담",
      health: "건강문제",
      employment: "취업",
      other: "기타",
    };
    return categoryMap[category] || category;
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              중도탈락 관리
            </h1>
            <p className="text-muted-foreground mt-1">
              중도탈락 학생 현황 및 환불 처리를 관리합니다
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            엑셀 다운로드
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="학생명, 이메일, 강의명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="환불 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="pending">대기중</SelectItem>
                <SelectItem value="approved">승인</SelectItem>
                <SelectItem value="rejected">거부</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>탈락일</TableHead>
                  <TableHead>학생명</TableHead>
                  <TableHead>강의명</TableHead>
                  <TableHead>탈락사유</TableHead>
                  <TableHead>환불금액</TableHead>
                  <TableHead>환불상태</TableHead>
                  <TableHead>처리일</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      로딩 중...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      중도탈락 기록이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {format(new Date(item.dropout_date), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell>{item.enrollment?.student?.full_name || "-"}</TableCell>
                      <TableCell>{item.enrollment?.course?.title || "-"}</TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className="mb-1">
                            {getCategoryBadge(item.reason_category)}
                          </Badge>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {item.dropout_reason}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.refund_amount ? `₩${item.refund_amount.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.refund_status)}</TableCell>
                      <TableCell>
                        {item.processed_at ? format(new Date(item.processed_at), "yyyy-MM-dd") : "-"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          상세
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDropoutManagement;
