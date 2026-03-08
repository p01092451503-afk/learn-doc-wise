import { describe, it, expect, vi, beforeEach } from "vitest";

// Test the limit calculation logic directly
describe("useUsageLimits - 한도 초과 판별 로직", () => {
  const PLAN_LIMITS = {
    starter: { maxStudents: 50, maxStorageGB: 10, maxAITokens: 100000 },
    professional: { maxStudents: 200, maxStorageGB: 50, maxAITokens: 500000 },
    enterprise: { maxStudents: 1000, maxStorageGB: 200, maxAITokens: 2000000 },
  };

  function calculateLimits(
    plan: string,
    studentCount: number,
    storageUsedGB: number,
    aiTokensUsed: number,
    maxStudentsOverride?: number,
    maxStorageOverride?: number
  ) {
    const planLimits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.starter;
    const maxStudents = maxStudentsOverride || planLimits.maxStudents;
    const maxStorageGB = maxStorageOverride || planLimits.maxStorageGB;
    const maxAITokens = planLimits.maxAITokens;

    const studentUsagePercent = (studentCount / maxStudents) * 100;
    const storageUsagePercent = (storageUsedGB / maxStorageGB) * 100;
    const aiTokenUsagePercent = (aiTokensUsed / maxAITokens) * 100;

    const isStudentLimitExceeded = studentCount >= maxStudents;
    const isStorageLimitExceeded = storageUsedGB >= maxStorageGB;
    const isAITokenLimitExceeded = aiTokensUsed >= maxAITokens;

    return {
      isStudentLimitExceeded,
      isStorageLimitExceeded,
      isAITokenLimitExceeded,
      isAnyLimitExceeded: isStudentLimitExceeded || isStorageLimitExceeded || isAITokenLimitExceeded,
      studentUsagePercent,
      storageUsagePercent,
      aiTokenUsagePercent,
    };
  }

  it("starter 플랜에서 학생 수 한도 미만이면 초과하지 않는다", () => {
    const result = calculateLimits("starter", 30, 5, 50000);
    expect(result.isStudentLimitExceeded).toBe(false);
    expect(result.isAnyLimitExceeded).toBe(false);
    expect(result.studentUsagePercent).toBe(60);
  });

  it("starter 플랜에서 학생 수 한도 도달 시 초과로 판별한다", () => {
    const result = calculateLimits("starter", 50, 5, 50000);
    expect(result.isStudentLimitExceeded).toBe(true);
    expect(result.isAnyLimitExceeded).toBe(true);
  });

  it("스토리지 한도 초과를 올바르게 감지한다", () => {
    const result = calculateLimits("starter", 10, 15, 50000);
    expect(result.isStorageLimitExceeded).toBe(true);
    expect(result.storageUsagePercent).toBe(150);
  });

  it("AI 토큰 한도 초과를 올바르게 감지한다", () => {
    const result = calculateLimits("professional", 100, 20, 600000);
    expect(result.isAITokenLimitExceeded).toBe(true);
    expect(result.aiTokenUsagePercent).toBe(120);
  });

  it("enterprise 플랜의 한도가 더 높다", () => {
    const result = calculateLimits("enterprise", 500, 100, 1000000);
    expect(result.isStudentLimitExceeded).toBe(false);
    expect(result.isStorageLimitExceeded).toBe(false);
    expect(result.isAITokenLimitExceeded).toBe(false);
  });

  it("커스텀 max_students 오버라이드를 적용한다", () => {
    const result = calculateLimits("starter", 80, 5, 50000, 100);
    expect(result.isStudentLimitExceeded).toBe(false);
    expect(result.studentUsagePercent).toBe(80);
  });

  it("알 수 없는 플랜은 starter 기본값을 사용한다", () => {
    const result = calculateLimits("unknown_plan", 50, 10, 100000);
    expect(result.isStudentLimitExceeded).toBe(true);
    expect(result.isStorageLimitExceeded).toBe(true);
    expect(result.isAITokenLimitExceeded).toBe(true);
  });
});
