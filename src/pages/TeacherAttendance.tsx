import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar as CalendarIcon, Download, CalendarCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface AttendanceRecord {
  id: string;
  user_id: string;
  attendance_date: string;
  check_in_time: string | null;
  status: 'present' | 'late' | 'absent' | 'excused';
  profiles: {
    full_name: string;
  } | null;
}

interface TeacherAttendanceProps {
  isDemo?: boolean;
}

interface Course {
  id: string;
  title: string;
}

const TeacherAttendance = ({ isDemo = false }: TeacherAttendanceProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isDemo) {
      // 데모 과목 목록 설정
      setCourses([
        { id: 'demo-course-1', title: '부동산 경매 기초' },
        { id: 'demo-course-2', title: '부동산 경매 실전' },
        { id: 'demo-course-3', title: '권리분석 특강' },
      ]);
      setSelectedCourseId('demo-course-1');
    } else {
      fetchCourses();
    }
  }, [isDemo]);

  useEffect(() => {
    if (!selectedCourseId) return;

    if (isDemo) {
      // 데모 데이터 설정
      setStudents([
        { user_id: 'demo1', profiles: { full_name: '김철수', user_id: 'demo1' } },
        { user_id: 'demo2', profiles: { full_name: '이영희', user_id: 'demo2' } },
        { user_id: 'demo3', profiles: { full_name: '박민수', user_id: 'demo3' } },
        { user_id: 'demo4', profiles: { full_name: '정수진', user_id: 'demo4' } },
        { user_id: 'demo5', profiles: { full_name: '최동욱', user_id: 'demo5' } },
      ]);
      
      setAttendanceRecords([
        {
          id: 'att1',
          user_id: 'demo1',
          attendance_date: format(selectedDate, 'yyyy-MM-dd'),
          check_in_time: format(new Date(selectedDate.setHours(9, 0)), 'yyyy-MM-dd HH:mm:ss'),
          status: 'present',
          profiles: { full_name: '김철수' }
        },
        {
          id: 'att2',
          user_id: 'demo2',
          attendance_date: format(selectedDate, 'yyyy-MM-dd'),
          check_in_time: format(new Date(selectedDate.setHours(9, 15)), 'yyyy-MM-dd HH:mm:ss'),
          status: 'late',
          profiles: { full_name: '이영희' }
        },
        {
          id: 'att4',
          user_id: 'demo4',
          attendance_date: format(selectedDate, 'yyyy-MM-dd'),
          check_in_time: format(new Date(selectedDate.setHours(9, 5)), 'yyyy-MM-dd HH:mm:ss'),
          status: 'present',
          profiles: { full_name: '정수진' }
        },
      ]);
      
      setLoading(false);
    } else {
      fetchStudents();
      fetchAttendance();
    }
  }, [selectedCourseId, selectedDate, isDemo]);

  const fetchCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('instructor_id', user.id);

      if (error) throw error;
      
      setCourses(data || []);
      if (data && data.length > 0) {
        setSelectedCourseId(data[0].id);
      }
    } catch (error) {
      console.error('과목 목록 조회 오류:', error);
    }
  };

  const fetchStudents = async () => {
    if (!selectedCourseId) return;
    
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          user_id,
          profiles:user_id (
            full_name,
            user_id
          )
        `)
        .eq('course_id', selectedCourseId);

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('학생 목록 조회 오류:', error);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedCourseId) return;
    
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('course_id', selectedCourseId)
        .eq('attendance_date', dateStr);

      if (error) throw error;
      
      // 프로필 정보를 별도로 가져오기
      const userIds = data?.map(d => d.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);
      
      // 데이터 병합
      const recordsWithProfiles = (data || []).map(record => ({
        ...record,
        profiles: profiles?.find(p => p.user_id === record.user_id) || null
      })) as AttendanceRecord[];
      
      setAttendanceRecords(recordsWithProfiles);
    } catch (error) {
      console.error('출석 기록 조회 오류:', error);
      toast({
        title: "오류",
        description: "출석 기록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceStatus = async (recordId: string, newStatus: 'present' | 'late' | 'absent' | 'excused') => {
    if (isDemo) {
      // 데모 모드에서는 로컬 상태만 업데이트
      setAttendanceRecords(prev =>
        prev.map(record =>
          record.id === recordId ? { ...record, status: newStatus } : record
        )
      );
      
      toast({
        title: "데모 모드",
        description: "실제 서비스에서는 데이터가 저장됩니다.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('attendance')
        .update({ status: newStatus })
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "업데이트 완료",
        description: "출석 상태가 변경되었습니다.",
      });

      fetchAttendance();
    } catch (error) {
      console.error('출석 상태 업데이트 오류:', error);
      toast({
        title: "오류",
        description: "출석 상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['학생명', '날짜', '출석 시간', '상태'];
    const rows = attendanceRecords.map(record => [
      record.profiles?.full_name || '알 수 없음',
      record.attendance_date,
      record.check_in_time ? format(new Date(record.check_in_time), 'HH:mm:ss') : '-',
      record.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${format(selectedDate, 'yyyy-MM-dd')}.csv`;
    link.click();

    toast({
      title: "다운로드 완료",
      description: "출석 기록이 CSV 파일로 저장되었습니다.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <Badge className="gap-1 bg-green-500">
            <CheckCircle className="h-3 w-3" />
            출석
          </Badge>
        );
      case 'late':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            지각
          </Badge>
        );
      case 'absent':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            결석
          </Badge>
        );
      case 'excused':
        return (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            인정결석
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStudentAttendance = (userId: string) => {
    return attendanceRecords.find(record => record.user_id === userId);
  };

  const stats = {
    present: attendanceRecords.filter(r => r.status === 'present').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
    absent: students.length - attendanceRecords.length,
    excused: attendanceRecords.filter(r => r.status === 'excused').length,
  };

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <CalendarCheck className="h-7 w-7 text-primary" />
            출석 관리
          </h1>
          <p className="text-muted-foreground">학생들의 출석 현황을 관리하세요</p>
        </div>

        {/* 과목 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>과목 선택</CardTitle>
            <CardDescription>출석을 관리할 과목을 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-full md:w-[400px]">
                <SelectValue placeholder="과목을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {!selectedCourseId ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">과목을 선택해주세요.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(selectedDate, 'PPP', { locale: ko })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
              
              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                CSV 다운로드
              </Button>
            </div>
          </div>

            {/* 통계 */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>출석</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>지각</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>결석</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>인정결석</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
                </CardContent>
              </Card>
            </div>

            {/* 학생 목록 */}
            <Card>
              <CardHeader>
                <CardTitle>학생별 출석 현황</CardTitle>
                <CardDescription>
                  총 {students.length}명의 학생
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-6 text-muted-foreground">로딩 중...</p>
                ) : students.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">
                    등록된 학생이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {students.map((student) => {
                      const attendance = getStudentAttendance(student.user_id);
                      
                      return (
                        <div
                          key={student.user_id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium">{student.profiles?.full_name}</p>
                              {attendance?.check_in_time && (
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(attendance.check_in_time), 'HH:mm:ss')}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {attendance ? (
                              <>
                                {getStatusBadge(attendance.status)}
                                <Select
                                  value={attendance.status}
                                  onValueChange={(value) => updateAttendanceStatus(attendance.id, value as 'present' | 'late' | 'absent' | 'excused')}
                                >
                                  <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="present">출석</SelectItem>
                                    <SelectItem value="late">지각</SelectItem>
                                    <SelectItem value="absent">결석</SelectItem>
                                    <SelectItem value="excused">인정결석</SelectItem>
                                  </SelectContent>
                                </Select>
                              </>
                            ) : (
                              <Badge variant="outline">미체크</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherAttendance;