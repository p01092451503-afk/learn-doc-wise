import { describe, it, expect, vi, beforeEach } from "vitest";
import { clearTenantCache, getCurrentTenant, applyTenantBranding } from "../tenant-resolver";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "tenant-1",
                name: "Test Academy",
                slug: "test-academy",
                status: "active",
                branding: {},
                settings: {},
              },
              error: null,
            })),
            limit: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  id: "tenant-1",
                  name: "Test Academy",
                  slug: "test-academy",
                  status: "active",
                  branding: {},
                  settings: {},
                },
                error: null,
              })),
            })),
          })),
        })),
      })),
    })),
  },
}));

describe("tenant-resolver", () => {
  beforeEach(() => {
    clearTenantCache();
  });

  describe("clearTenantCache()", () => {
    it("캐시를 초기화한다", () => {
      clearTenantCache();
      expect(getCurrentTenant()).toBeNull();
    });
  });

  describe("getCurrentTenant()", () => {
    it("캐시가 없으면 null을 반환한다", () => {
      expect(getCurrentTenant()).toBeNull();
    });
  });

  describe("applyTenantBranding()", () => {
    it("primary_color가 있으면 CSS 변수를 설정한다", () => {
      const tenant = {
        id: "t1",
        name: "Test",
        slug: "test",
        status: "active",
        branding: { primary_color: "#ff0000" },
        settings: {},
      };

      applyTenantBranding(tenant);
      expect(document.documentElement.style.getPropertyValue("--primary")).toBe("#ff0000");
    });

    it("테넌트 이름으로 document.title을 설정한다", () => {
      const tenant = {
        id: "t1",
        name: "My Academy",
        slug: "my-academy",
        status: "active",
        branding: {},
        settings: {},
      };

      applyTenantBranding(tenant);
      expect(document.title).toBe("My Academy - LMS");
    });
  });
});
