import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      signInWithPassword: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
  },
}));

// Must import Auth after mocks
import Auth from "@/pages/Auth";

function renderAuth() {
  return render(
    <MemoryRouter>
      <Auth />
    </MemoryRouter>
  );
}

describe("Auth 페이지", () => {
  it("로그인 폼이 렌더링된다", () => {
    renderAuth();
    expect(screen.getByText("환영합니다")).toBeInTheDocument();
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
  });

  it("로그인/회원가입 탭이 존재한다", () => {
    renderAuth();
    expect(screen.getByRole("tab", { name: "로그인" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "회원가입" })).toBeInTheDocument();
  });

  it("이메일 입력이 가능하다", async () => {
    const user = userEvent.setup();
    renderAuth();

    const emailInput = screen.getByLabelText("이메일");
    await user.type(emailInput, "user@example.com");
    expect(emailInput).toHaveValue("user@example.com");
  });

  it("비밀번호 입력이 가능하다", async () => {
    const user = userEvent.setup();
    renderAuth();

    const passwordInput = screen.getByLabelText("비밀번호");
    await user.type(passwordInput, "secret123");
    expect(passwordInput).toHaveValue("secret123");
  });

  it("로그인 버튼이 존재한다", () => {
    renderAuth();
    expect(screen.getByRole("button", { name: /로그인/i })).toBeInTheDocument();
  });
});
