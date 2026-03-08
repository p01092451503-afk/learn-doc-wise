import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrandingSettings } from "../admin/BrandingSettings";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { metadata: {} }, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: "" } })),
      })),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("BrandingSettings", () => {
  it("폼 요소들이 렌더링된다", async () => {
    render(<BrandingSettings tenantId="test-tenant-id" />);

    // Wait for loading to finish
    const saveButton = await screen.findByRole("button", { name: /저장/i });
    expect(saveButton).toBeInTheDocument();
  });

  it("색상 입력 필드가 3개 렌더링된다", async () => {
    render(<BrandingSettings tenantId="test-tenant-id" />);

    const primaryLabel = await screen.findByText("주 색상");
    const secondaryLabel = screen.getByText("보조 색상");
    const accentLabel = screen.getByText("강조 색상");

    expect(primaryLabel).toBeInTheDocument();
    expect(secondaryLabel).toBeInTheDocument();
    expect(accentLabel).toBeInTheDocument();
  });

  it("폰트 패밀리 입력이 렌더링된다", async () => {
    render(<BrandingSettings tenantId="test-tenant-id" />);

    const fontInput = await screen.findByLabelText("폰트 패밀리");
    expect(fontInput).toBeInTheDocument();
  });

  it("환영 메시지 텍스트영역이 렌더링된다", async () => {
    render(<BrandingSettings tenantId="test-tenant-id" />);

    const textarea = await screen.findByLabelText("환영 메시지");
    expect(textarea).toBeInTheDocument();
  });
});
