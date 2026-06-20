import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivityLogger } from "@/components/ActivityLogger";
import { useCarbonStore } from "@/store/carbonStore";

describe("ActivityLogger", () => {
  beforeEach(() => {
    useCarbonStore.getState().clearAll();
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ tip: "Test tip" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Drive the picker → action → quantity → submit flow with the given quantity. */
  async function walkLogFlow(user: ReturnType<typeof userEvent.setup>, quantity = "2") {
    render(<ActivityLogger />);
    await user.click(screen.getByRole("radio", { name: /transport/i }));
    await screen.findByRole("listbox");
    await user.click(screen.getAllByRole("option")[0]!);
    const qty = await screen.findByLabelText(/quantity in/i);
    await user.clear(qty);
    await user.type(qty, quantity);
    await user.click(screen.getByRole("button", { name: /log activity/i }));
  }

  it("walks through the full log flow and calls addEntry", async () => {
    const user = userEvent.setup();
    render(<ActivityLogger />);

    // Choose category
    await user.click(screen.getByRole("radio", { name: /transport/i }));
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toBeInTheDocument();

    // Choose first action
    const options = screen.getAllByRole("option");
    await user.click(options[0]!);

    // Quantity input appears
    const qty = await screen.findByLabelText(/quantity in/i);
    expect(qty).toBeInTheDocument();

    // Type quantity → preview updates
    await user.clear(qty);
    await user.type(qty, "2");
    expect(screen.getByText(/kg CO₂/i)).toBeInTheDocument();

    // Submit
    await user.click(screen.getByRole("button", { name: /log activity/i }));

    await waitFor(() => {
      expect(useCarbonStore.getState().logEntries.length).toBe(1);
    });

    // Tip panel shows
    await waitFor(() => {
      expect(screen.getByText("Test tip")).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith("/api/tip", expect.any(Object));
  });

  it("still logs the entry and shows a degraded message when the tip service responds non-ok", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("busy", { status: 503 }));
    const user = userEvent.setup();
    await walkLogFlow(user);

    await waitFor(() => expect(useCarbonStore.getState().logEntries.length).toBe(1));
    await waitFor(() => expect(screen.getByText(/tip service is busy/i)).toBeInTheDocument());
  });

  it("still logs the entry and shows an unavailable message when the tip request rejects", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network down"));
    const user = userEvent.setup();
    await walkLogFlow(user);

    await waitFor(() => expect(useCarbonStore.getState().logEntries.length).toBe(1));
    await waitFor(() =>
      expect(screen.getByText(/tip service is unavailable/i)).toBeInTheDocument()
    );
  });
});
