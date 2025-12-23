import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AtRiskLearner {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_id: string;
  tenant_id?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  risk_factors: {
    inactive_days?: boolean;
    low_progress?: boolean;
    missed_deadlines?: boolean;
    poor_quiz_scores?: boolean;
    low_attendance?: boolean;
  };
  last_activity_at?: string;
  days_inactive: number;
  current_progress: number;
  notification_sent: boolean;
  notification_sent_at?: string;
  resolved: boolean;
  resolved_at?: string;
  notes?: string;
  // 조인된 데이터
  user_name?: string;
  user_email?: string;
  course_title?: string;
}

interface RiskThresholds {
  inactiveDays: { medium: number; high: number; critical: number };
  progressPercent: { medium: number; high: number; critical: number };
}

const DEFAULT_THRESHOLDS: RiskThresholds = {
  inactiveDays: { medium: 3, high: 7, critical: 14 },
  progressPercent: { medium: 50, high: 30, critical: 10 },
};

export const useAtRiskLearners = (courseId?: string, tenantId?: string) => {
  const { toast } = useToast();
  const [atRiskLearners, setAtRiskLearners] = useState<AtRiskLearner[]>([]);
  const [loading, setLoading] = useState(false);

  // 위험군 학습자 목록 조회
  const fetchAtRiskLearners = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("at_risk_learners")
        .select("*")
        .eq("resolved", false)
        .order("risk_score", { ascending: false });

      if (courseId) {
        query = query.eq("course_id", courseId);
      }
      if (tenantId) {
        query = query.eq("tenant_id", tenantId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // 프로필 정보 조인
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(d => d.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const courseIds = [...new Set(data.map(d => d.course_id))];
        const { data: courses } = await supabase
          .from("courses")
          .select("id, title")
          .in("id", courseIds);

        const enrichedData = data.map(item => ({
          ...item,
          risk_level: item.risk_level as 'low' | 'medium' | 'high' | 'critical',
          risk_factors: item.risk_factors as AtRiskLearner['risk_factors'],
          user_name: profiles?.find(p => p.user_id === item.user_id)?.full_name,
          course_title: courses?.find(c => c.id === item.course_id)?.title,
        }));

        setAtRiskLearners(enrichedData);
      } else {
        setAtRiskLearners([]);
      }
    } catch (error) {
      console.error("Failed to fetch at-risk learners:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId, tenantId]);

  // 위험도 점수 계산
  const calculateRiskScore = useCallback((
    daysInactive: number,
    progress: number,
    thresholds: RiskThresholds = DEFAULT_THRESHOLDS
  ): { score: number; level: 'low' | 'medium' | 'high' | 'critical'; factors: AtRiskLearner['risk_factors'] } => {
    let score = 0;
    const factors: AtRiskLearner['risk_factors'] = {};

    // 비활동 일수 기반 점수
    if (daysInactive >= thresholds.inactiveDays.critical) {
      score += 40;
      factors.inactive_days = true;
    } else if (daysInactive >= thresholds.inactiveDays.high) {
      score += 25;
      factors.inactive_days = true;
    } else if (daysInactive >= thresholds.inactiveDays.medium) {
      score += 15;
      factors.inactive_days = true;
    }

    // 진도율 기반 점수 (낮을수록 위험)
    if (progress <= thresholds.progressPercent.critical) {
      score += 40;
      factors.low_progress = true;
    } else if (progress <= thresholds.progressPercent.high) {
      score += 25;
      factors.low_progress = true;
    } else if (progress <= thresholds.progressPercent.medium) {
      score += 15;
      factors.low_progress = true;
    }

    // 위험 레벨 결정
    let level: 'low' | 'medium' | 'high' | 'critical';
    if (score >= 70) {
      level = 'critical';
    } else if (score >= 50) {
      level = 'high';
    } else if (score >= 25) {
      level = 'medium';
    } else {
      level = 'low';
    }

    return { score, level, factors };
  }, []);

  // 전체 학습자 위험도 스캔
  const scanForAtRiskLearners = useCallback(async (targetCourseId?: string) => {
    const scanCourseId = targetCourseId || courseId;
    if (!scanCourseId) return [];

    setLoading(true);
    try {
      // 수강생 목록 조회
      const { data: enrollments, error: enrollmentError } = await supabase
        .from("enrollments")
        .select(`
          id,
          user_id,
          course_id,
          progress,
          enrolled_at
        `)
        .eq("course_id", scanCourseId)
        .is("completed_at", null);

      if (enrollmentError) throw enrollmentError;
      if (!enrollments || enrollments.length === 0) return [];

      const results: AtRiskLearner[] = [];

      for (const enrollment of enrollments) {
        // 마지막 활동 시간 조회
        const { data: lastActivity } = await supabase
          .from("content_progress")
          .select("last_accessed_at")
          .eq("user_id", enrollment.user_id)
          .order("last_accessed_at", { ascending: false })
          .limit(1)
          .single();

        const lastActivityAt = lastActivity?.last_accessed_at || enrollment.enrolled_at;
        const daysInactive = Math.floor(
          (Date.now() - new Date(lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        const { score, level, factors } = calculateRiskScore(
          daysInactive,
          enrollment.progress || 0
        );

        // 위험군인 경우만 저장 (score >= 25)
        if (score >= 25) {
          // 기존 레코드 확인
          const { data: existing } = await supabase
            .from("at_risk_learners")
            .select("id")
            .eq("enrollment_id", enrollment.id)
            .eq("resolved", false)
            .single();

          const riskData = {
            user_id: enrollment.user_id,
            course_id: enrollment.course_id,
            enrollment_id: enrollment.id,
            tenant_id: tenantId || null,
            risk_level: level,
            risk_score: score,
            risk_factors: factors,
            last_activity_at: lastActivityAt,
            days_inactive: daysInactive,
            current_progress: enrollment.progress || 0,
            updated_at: new Date().toISOString(),
          };

          if (existing) {
            await supabase
              .from("at_risk_learners")
              .update(riskData)
              .eq("id", existing.id);
          } else {
            await supabase
              .from("at_risk_learners")
              .insert({
                ...riskData,
                notification_sent: false,
                resolved: false,
              });
          }

          results.push({
            id: existing?.id || '',
            ...riskData,
            notification_sent: false,
            resolved: false,
          } as AtRiskLearner);
        }
      }

      await fetchAtRiskLearners();

      toast({
        title: "스캔 완료",
        description: `${results.length}명의 위험군 학습자가 감지되었습니다.`,
      });

      return results;
    } catch (error) {
      console.error("Failed to scan for at-risk learners:", error);
      toast({
        title: "스캔 실패",
        description: "위험군 스캔 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [courseId, tenantId, calculateRiskScore, fetchAtRiskLearners, toast]);

  // 알림 전송 표시
  const markNotificationSent = useCallback(async (learnerId: string) => {
    try {
      await supabase
        .from("at_risk_learners")
        .update({
          notification_sent: true,
          notification_sent_at: new Date().toISOString(),
        })
        .eq("id", learnerId);

      await fetchAtRiskLearners();

      toast({
        title: "알림 전송됨",
        description: "학습자에게 알림이 전송되었습니다.",
      });
    } catch (error) {
      console.error("Failed to mark notification sent:", error);
    }
  }, [fetchAtRiskLearners, toast]);

  // 위험군 해제
  const resolveAtRiskLearner = useCallback(async (learnerId: string, notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from("at_risk_learners")
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
          notes,
        })
        .eq("id", learnerId);

      await fetchAtRiskLearners();

      toast({
        title: "해제 완료",
        description: "위험군에서 해제되었습니다.",
      });
    } catch (error) {
      console.error("Failed to resolve at-risk learner:", error);
      toast({
        title: "해제 실패",
        description: "위험군 해제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  }, [fetchAtRiskLearners, toast]);

  // 통계
  const getStatistics = useCallback(() => {
    const total = atRiskLearners.length;
    const critical = atRiskLearners.filter(l => l.risk_level === 'critical').length;
    const high = atRiskLearners.filter(l => l.risk_level === 'high').length;
    const medium = atRiskLearners.filter(l => l.risk_level === 'medium').length;
    const notified = atRiskLearners.filter(l => l.notification_sent).length;

    return { total, critical, high, medium, notified };
  }, [atRiskLearners]);

  return {
    atRiskLearners,
    loading,
    fetchAtRiskLearners,
    scanForAtRiskLearners,
    markNotificationSent,
    resolveAtRiskLearner,
    getStatistics,
  };
};
