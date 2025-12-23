import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CompletionCriteria {
  id: string;
  course_id: string;
  min_progress_percent: number;
  min_quiz_score: number;
  min_assignment_score: number;
  min_attendance_rate: number;
  require_all_quizzes: boolean;
  require_all_assignments: boolean;
}

export interface CompletionResult {
  id: string;
  enrollment_id: string;
  user_id: string;
  course_id: string;
  progress_percent: number;
  quiz_average_score: number;
  assignment_average_score: number;
  attendance_rate: number;
  is_completed: boolean;
  completed_at?: string;
  evaluation_details: {
    progress_met: boolean;
    quiz_met: boolean;
    assignment_met: boolean;
    attendance_met: boolean;
    all_quizzes_taken: boolean;
    all_assignments_submitted: boolean;
    missing_requirements: string[];
  };
}

export const useCompletionCalculator = (courseId?: string) => {
  const { toast } = useToast();
  const [criteria, setCriteria] = useState<CompletionCriteria | null>(null);
  const [loading, setLoading] = useState(false);

  // 수료 기준 조회
  const fetchCriteria = useCallback(async () => {
    if (!courseId) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("completion_criteria")
        .select("*")
        .eq("course_id", courseId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setCriteria(data);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to fetch criteria:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // 수료 기준 설정/업데이트
  const saveCriteria = useCallback(async (criteriaData: Partial<CompletionCriteria>) => {
    if (!courseId) return null;

    try {
      const { data: existing } = await supabase
        .from("completion_criteria")
        .select("id")
        .eq("course_id", courseId)
        .single();

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from("completion_criteria")
          .update({
            ...criteriaData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("completion_criteria")
          .insert({
            course_id: courseId,
            ...criteriaData,
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      setCriteria(result);
      toast({
        title: "저장 완료",
        description: "수료 기준이 저장되었습니다.",
      });

      return result;
    } catch (error) {
      console.error("Failed to save criteria:", error);
      toast({
        title: "저장 실패",
        description: "수료 기준 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return null;
    }
  }, [courseId, toast]);

  // 학생의 수료 여부 계산
  const calculateCompletion = useCallback(async (userId: string, enrollmentId: string): Promise<CompletionResult | null> => {
    if (!courseId) return null;

    try {
      // 수료 기준 가져오기
      const { data: criteriaData } = await supabase
        .from("completion_criteria")
        .select("*")
        .eq("course_id", courseId)
        .single();
      
      const currentCriteria = criteriaData || criteria || {
        id: '',
        course_id: courseId,
        min_progress_percent: 80,
        min_quiz_score: 60,
        min_assignment_score: 60,
        min_attendance_rate: 80,
        require_all_quizzes: true,
        require_all_assignments: false,
      };

      // 1. 진도율 계산
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("progress")
        .eq("id", enrollmentId)
        .single();

      const progressPercent = enrollment?.progress || 0;

      // 2. 퀴즈 점수 평균 계산
      const { data: quizAttempts } = await supabase
        .from("quiz_attempts")
        .select("score, max_score, quiz_id")
        .eq("user_id", userId)
        .eq("status", "graded");

      const courseQuizAttempts = quizAttempts?.filter(a => a.score !== null) || [];
      const quizAverageScore = courseQuizAttempts.length > 0
        ? courseQuizAttempts.reduce((sum, a) => sum + ((a.score || 0) / (a.max_score || 100) * 100), 0) / courseQuizAttempts.length
        : 0;

      // 3. 과제 점수 평균 계산
      const { data: submissions } = await supabase
        .from("assignment_submissions")
        .select("score, assignment_id, assignments!inner(course_id, max_score)")
        .eq("student_id", userId)
        .eq("assignments.course_id", courseId)
        .eq("status", "graded");

      const assignmentAverageScore = submissions && submissions.length > 0
        ? submissions.reduce((sum, s) => {
            const maxScore = (s.assignments as unknown as { max_score: number })?.max_score || 100;
            return sum + ((s.score || 0) / maxScore * 100);
          }, 0) / submissions.length
        : 0;

      // 4. 출석률 계산
      const { data: attendanceData, count: totalDays } = await supabase
        .from("attendance")
        .select("status", { count: "exact" })
        .eq("user_id", userId)
        .eq("course_id", courseId);

      const presentDays = attendanceData?.filter(a => a.status === 'present' || a.status === 'late').length || 0;
      const attendanceRate = totalDays && totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

      // 5. 모든 퀴즈 응시 여부 확인
      const { count: totalQuizzes } = await supabase
        .from("quizzes")
        .select("*", { count: "exact", head: true })
        .eq("course_id", courseId)
        .eq("is_published", true);

      const uniqueQuizIds = new Set(courseQuizAttempts.map(a => a.quiz_id));
      const allQuizzesTaken = totalQuizzes ? uniqueQuizIds.size >= totalQuizzes : true;

      // 6. 모든 과제 제출 여부 확인
      const { count: totalAssignments } = await supabase
        .from("assignments")
        .select("*", { count: "exact", head: true })
        .eq("course_id", courseId)
        .eq("status", "published");

      const allAssignmentsSubmitted = totalAssignments ? (submissions?.length || 0) >= totalAssignments : true;

      // 수료 여부 판정
      const progressMet = progressPercent >= currentCriteria.min_progress_percent;
      const quizMet = quizAverageScore >= currentCriteria.min_quiz_score;
      const assignmentMet = assignmentAverageScore >= currentCriteria.min_assignment_score;
      const attendanceMet = attendanceRate >= currentCriteria.min_attendance_rate;
      const quizRequirementMet = !currentCriteria.require_all_quizzes || allQuizzesTaken;
      const assignmentRequirementMet = !currentCriteria.require_all_assignments || allAssignmentsSubmitted;

      const isCompleted = progressMet && quizMet && assignmentMet && attendanceMet && quizRequirementMet && assignmentRequirementMet;

      // 미충족 요건 목록
      const missingRequirements: string[] = [];
      if (!progressMet) missingRequirements.push(`진도율 ${currentCriteria.min_progress_percent}% 이상`);
      if (!quizMet) missingRequirements.push(`퀴즈 평균 ${currentCriteria.min_quiz_score}점 이상`);
      if (!assignmentMet) missingRequirements.push(`과제 평균 ${currentCriteria.min_assignment_score}점 이상`);
      if (!attendanceMet) missingRequirements.push(`출석률 ${currentCriteria.min_attendance_rate}% 이상`);
      if (!quizRequirementMet) missingRequirements.push("모든 퀴즈 응시");
      if (!assignmentRequirementMet) missingRequirements.push("모든 과제 제출");

      const evaluationDetails = {
        progress_met: progressMet,
        quiz_met: quizMet,
        assignment_met: assignmentMet,
        attendance_met: attendanceMet,
        all_quizzes_taken: allQuizzesTaken,
        all_assignments_submitted: allAssignmentsSubmitted,
        missing_requirements: missingRequirements,
      };

      // 결과 저장
      const { data: existingResult } = await supabase
        .from("completion_results")
        .select("id")
        .eq("enrollment_id", enrollmentId)
        .single();

      const resultData = {
        enrollment_id: enrollmentId,
        user_id: userId,
        course_id: courseId,
        progress_percent: progressPercent,
        quiz_average_score: quizAverageScore,
        assignment_average_score: assignmentAverageScore,
        attendance_rate: attendanceRate,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        evaluation_details: evaluationDetails,
        updated_at: new Date().toISOString(),
      };

      let savedResult;
      if (existingResult) {
        const { data } = await supabase
          .from("completion_results")
          .update(resultData)
          .eq("id", existingResult.id)
          .select()
          .single();
        savedResult = data;
      } else {
        const { data } = await supabase
          .from("completion_results")
          .insert(resultData)
          .select()
          .single();
        savedResult = data;
      }

      return {
        ...savedResult,
        evaluation_details: evaluationDetails,
      } as CompletionResult;
    } catch (error) {
      console.error("Failed to calculate completion:", error);
      return null;
    }
  }, [courseId, criteria]);

  // 전체 학생 수료 일괄 계산
  const calculateAllCompletions = useCallback(async (): Promise<CompletionResult[]> => {
    if (!courseId) return [];

    setLoading(true);
    try {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id, user_id")
        .eq("course_id", courseId);

      if (!enrollments || enrollments.length === 0) return [];

      const results: CompletionResult[] = [];
      for (const enrollment of enrollments) {
        const result = await calculateCompletion(enrollment.user_id, enrollment.id);
        if (result) results.push(result);
      }

      toast({
        title: "계산 완료",
        description: `${results.length}명의 수료 여부가 계산되었습니다.`,
      });

      return results;
    } catch (error) {
      console.error("Failed to calculate all completions:", error);
      toast({
        title: "계산 실패",
        description: "수료 계산 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [courseId, calculateCompletion, toast]);

  return {
    criteria,
    loading,
    fetchCriteria,
    saveCriteria,
    calculateCompletion,
    calculateAllCompletions,
  };
};
