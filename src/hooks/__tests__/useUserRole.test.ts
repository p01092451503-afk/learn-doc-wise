import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useUserRole } from "../useUserRole";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
    },
    from: () => mockFrom(),
  },
}));

function setupMockRoles(roles: Array<{ role: string; tenant_id: string | null }>) {
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        data: roles,
        error: null,
      }),
    }),
  });
}

describe("useUserRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로그인하지 않은 경우 null 역할을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.role).toBeNull();
    expect(result.current.isOperator).toBe(false);
  });

  it("admin 역할을 올바르게 판별한다", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "admin@test.com" } },
    });
    setupMockRoles([{ role: "admin", tenant_id: "tenant-1" }]);

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.role).toBe("admin");
    expect(result.current.tenantId).toBe("tenant-1");
  });

  it("operator 역할을 올바르게 판별한다", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-2", email: "op@test.com" } },
    });
    setupMockRoles([{ role: "operator", tenant_id: null }]);

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.role).toBe("operator");
    expect(result.current.isOperator).toBe(true);
  });

  it("test@test.com 데모 계정은 operator가 될 수 없다", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-3", email: "test@test.com" } },
    });
    setupMockRoles([{ role: "operator", tenant_id: null }]);

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => expect(result.current.loading).toBe(false));
    // Demo account should not get operator role
    expect(result.current.isOperator).toBe(false);
  });
});
