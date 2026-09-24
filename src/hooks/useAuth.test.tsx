import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "./useAuth";

const unsubscribe = vi.fn();
const getUser = vi.fn();
let authCallback: (event: string, session: { user: unknown } | null) => void;

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => getUser(...args),
      onAuthStateChange: (callback: typeof authCallback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe } } };
      },
    },
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user: null } });
  });

  it("loads the initial session", async () => {
    const user = { id: "user-1" };
    getUser.mockResolvedValue({ data: { user } });
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user).toEqual(user);
    expect(result.current.isLoading).toBe(false);
  });

  it("reacts to login and logout and unsubscribes", async () => {
    const { result, unmount } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => authCallback("SIGNED_IN", { user: { id: "user-2" } }));
    expect(result.current.isAuthenticated).toBe(true);
    act(() => authCallback("SIGNED_OUT", null));
    expect(result.current.isAuthenticated).toBe(false);
    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});