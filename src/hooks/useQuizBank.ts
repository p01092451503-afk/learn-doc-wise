import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface QuizQuestion {
  id: string;
  course_id?: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: { text: string; is_correct: boolean }[];
  correct_answer?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  explanation?: string;
  is_active: boolean;
}

export interface Quiz {
  id: string;
  course_id?: string;
  title: string;
  description?: string;
  time_limit_minutes?: number;
  pass_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_correct_answers: boolean;
  question_count: number;
  is_published: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  started_at: string;
  submitted_at?: string;
  score?: number;
  max_score?: number;
  passed?: boolean;
  status: 'in_progress' | 'submitted' | 'graded' | 'abandoned';
  tab_switch_count: number;
}

export const useQuizBank = (courseId?: string) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);

  // 문제 목록 조회
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("quiz_questions")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (courseId) {
        query = query.eq("course_id", courseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setQuestions((data || []).map(q => ({
        ...q,
        options: q.options as { text: string; is_correct: boolean }[] | undefined,
        question_type: q.question_type as 'multiple_choice' | 'true_false' | 'short_answer',
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard'
      })));
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // 퀴즈 목록 조회
  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (courseId) {
        query = query.eq("course_id", courseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // 문제 생성
  const createQuestion = useCallback(async (question: Omit<QuizQuestion, 'id' | 'is_active'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("quiz_questions")
        .insert({
          ...question,
          course_id: courseId,
          created_by: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "문제 생성 완료",
        description: "새로운 문제가 문제은행에 추가되었습니다.",
      });

      await fetchQuestions();
      return data;
    } catch (error) {
      console.error("Failed to create question:", error);
      toast({
        title: "문제 생성 실패",
        description: "문제를 생성하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return null;
    }
  }, [courseId, toast, fetchQuestions]);

  // 퀴즈 생성
  const createQuiz = useCallback(async (quiz: Omit<Quiz, 'id'>, questionIds: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 퀴즈 생성
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          ...quiz,
          course_id: courseId,
          created_by: user.id,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // 문제 풀에 연결
      if (questionIds.length > 0) {
        const poolData = questionIds.map(qId => ({
          quiz_id: quizData.id,
          question_id: qId,
        }));

        const { error: poolError } = await supabase
          .from("quiz_question_pool")
          .insert(poolData);

        if (poolError) throw poolError;
      }

      toast({
        title: "퀴즈 생성 완료",
        description: "새로운 퀴즈가 생성되었습니다.",
      });

      await fetchQuizzes();
      return quizData;
    } catch (error) {
      console.error("Failed to create quiz:", error);
      toast({
        title: "퀴즈 생성 실패",
        description: "퀴즈를 생성하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return null;
    }
  }, [courseId, toast, fetchQuizzes]);

  // 랜덤 문제 출제
  const getRandomQuestions = useCallback(async (quizId: string, count: number): Promise<QuizQuestion[]> => {
    try {
      // 해당 퀴즈의 문제 풀에서 문제 ID 가져오기
      const { data: poolData, error: poolError } = await supabase
        .from("quiz_question_pool")
        .select("question_id")
        .eq("quiz_id", quizId);

      if (poolError) throw poolError;

      const questionIds = poolData?.map(p => p.question_id) || [];

      if (questionIds.length === 0) {
        // 문제 풀이 없으면 코스의 모든 활성 문제에서 가져오기
        const { data, error } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("is_active", true)
          .eq("course_id", courseId);

        if (error) throw error;

        const shuffled = (data || []).sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(q => ({
          ...q,
          options: q.options as { text: string; is_correct: boolean }[] | undefined,
          question_type: q.question_type as 'multiple_choice' | 'true_false' | 'short_answer',
          difficulty: q.difficulty as 'easy' | 'medium' | 'hard'
        }));
      }

      // 문제 풀에서 랜덤 선택
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .in("id", questionIds)
        .eq("is_active", true);

      if (error) throw error;

      const shuffled = (data || []).sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count).map(q => ({
        ...q,
        options: q.options as { text: string; is_correct: boolean }[] | undefined,
        question_type: q.question_type as 'multiple_choice' | 'true_false' | 'short_answer',
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard'
      }));
    } catch (error) {
      console.error("Failed to get random questions:", error);
      return [];
    }
  }, [courseId]);

  // 퀴즈 응시 시작
  const startQuizAttempt = useCallback(async (quizId: string): Promise<QuizAttempt | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 기존 진행중인 응시가 있는지 확인
      const { data: existingAttempt } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("user_id", user.id)
        .eq("status", "in_progress")
        .single();

      if (existingAttempt) {
        return existingAttempt as QuizAttempt;
      }

      // 최대 응시 횟수 확인
      const { data: quiz } = await supabase
        .from("quizzes")
        .select("max_attempts")
        .eq("id", quizId)
        .single();

      const { count } = await supabase
        .from("quiz_attempts")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", quizId)
        .eq("user_id", user.id);

      if (quiz && count !== null && count >= quiz.max_attempts) {
        toast({
          title: "응시 제한",
          description: `최대 응시 횟수(${quiz.max_attempts}회)를 초과했습니다.`,
          variant: "destructive",
        });
        return null;
      }

      // 새 응시 생성
      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({
          quiz_id: quizId,
          user_id: user.id,
          status: "in_progress",
          tab_switch_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      return data as QuizAttempt;
    } catch (error) {
      console.error("Failed to start quiz attempt:", error);
      toast({
        title: "퀴즈 시작 실패",
        description: "퀴즈를 시작하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  // 탭 이탈 기록
  const recordTabSwitch = useCallback(async (attemptId: string) => {
    try {
      const { data } = await supabase
        .from("quiz_attempts")
        .select("tab_switch_count, browser_warnings")
        .eq("id", attemptId)
        .single();

      if (data) {
        const warnings = (data.browser_warnings as unknown[]) || [];
        await supabase
          .from("quiz_attempts")
          .update({
            tab_switch_count: (data.tab_switch_count || 0) + 1,
            browser_warnings: [...warnings, {
              type: "tab_switch",
              timestamp: new Date().toISOString(),
            }],
          })
          .eq("id", attemptId);
      }
    } catch (error) {
      console.error("Failed to record tab switch:", error);
    }
  }, []);

  // 답안 저장
  const saveAnswer = useCallback(async (
    attemptId: string,
    questionId: string,
    selectedAnswer: string | number | boolean | object | null,
    isCorrect: boolean,
    pointsEarned: number
  ) => {
    try {
      // 기존 답안이 있는지 확인
      const { data: existing } = await supabase
        .from("quiz_answers")
        .select("id")
        .eq("attempt_id", attemptId)
        .eq("question_id", questionId)
        .single();

      const answerJson = selectedAnswer as import("@/integrations/supabase/types").Json;

      if (existing) {
        await supabase
          .from("quiz_answers")
          .update({
            selected_answer: answerJson,
            is_correct: isCorrect,
            points_earned: pointsEarned,
            answered_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        const { error } = await supabase
          .from("quiz_answers")
          .insert([{
            attempt_id: attemptId,
            question_id: questionId,
            selected_answer: answerJson,
            is_correct: isCorrect,
            points_earned: pointsEarned,
          }]);
        if (error) console.error("Insert error:", error);
      }
    } catch (error) {
      console.error("Failed to save answer:", error);
    }
  }, []);

  // 퀴즈 제출
  const submitQuiz = useCallback(async (attemptId: string): Promise<{ score: number; maxScore: number; passed: boolean } | null> => {
    try {
      // 답안 합계 계산
      const { data: answers, error: answersError } = await supabase
        .from("quiz_answers")
        .select("points_earned")
        .eq("attempt_id", attemptId);

      if (answersError) throw answersError;

      const score = answers?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;

      // 최대 점수 계산
      const { data: attempt } = await supabase
        .from("quiz_attempts")
        .select("quiz_id")
        .eq("id", attemptId)
        .single();

      if (!attempt) throw new Error("Attempt not found");

      const { data: quiz } = await supabase
        .from("quizzes")
        .select("pass_score, question_count")
        .eq("id", attempt.quiz_id)
        .single();

      const maxScore = (quiz?.question_count || 10) * 10; // 문제당 10점 기본
      const passed = score >= ((quiz?.pass_score || 60) / 100 * maxScore);

      // 결과 저장
      await supabase
        .from("quiz_attempts")
        .update({
          submitted_at: new Date().toISOString(),
          score,
          max_score: maxScore,
          passed,
          status: "graded",
        })
        .eq("id", attemptId);

      toast({
        title: passed ? "합격!" : "불합격",
        description: `점수: ${score}/${maxScore} (${Math.round(score / maxScore * 100)}%)`,
        variant: passed ? "default" : "destructive",
      });

      return { score, maxScore, passed };
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast({
        title: "제출 실패",
        description: "퀴즈를 제출하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  return {
    questions,
    quizzes,
    loading,
    fetchQuestions,
    fetchQuizzes,
    createQuestion,
    createQuiz,
    getRandomQuestions,
    startQuizAttempt,
    recordTabSwitch,
    saveAnswer,
    submitQuiz,
  };
};
