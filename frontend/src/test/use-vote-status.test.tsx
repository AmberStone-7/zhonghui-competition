import { describe, expect, test, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("../api/client", () => ({ default: { get: vi.fn() } }));
import api from "../api/client";
import { useVoteStatus } from "../hooks/useVoteStatus";

const mockGet = api.get as ReturnType<typeof vi.fn>;

afterEach(() => {
  mockGet.mockReset();
});

describe("useVoteStatus hook", () => {
  test("returns open status when API responds", async () => {
    mockGet.mockResolvedValueOnce({ data: { channel_status: "open", custom_message: "欢迎投票" } });
    const { result } = renderHook(() => useVoteStatus());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.status).toBe("open");
    expect(result.current.message).toBe("欢迎投票");
    expect(result.current.isError).toBe(false);
  });

  test("sets isError to true when API fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"));
    const { result } = renderHook(() => useVoteStatus());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isError).toBe(true);
    // status should remain default "closed" when error
    expect(result.current.status).toBe("closed");
  });
});
