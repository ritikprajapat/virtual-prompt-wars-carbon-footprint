"use client";
import { useMemo, useState } from "react";
import { useCarbonStore } from "@/store/carbonStore";
import { calcCo2 } from "@/lib/emissions";
import { startOfTodayMs } from "@/lib/utils";
import { postJson } from "@/lib/apiClient";
import { CategoryPicker } from "@/components/logger/CategoryPicker";
import { ActionPicker } from "@/components/logger/ActionPicker";
import { QuantitySubmit } from "@/components/logger/QuantitySubmit";
import { CoachTip } from "@/components/logger/CoachTip";
import { TodayLog } from "@/components/logger/TodayLog";
import type { ActionItem, Category } from "@/types";

/** Default quantity pre-filled when an action is selected. */
const DEFAULT_QUANTITY = 1;

/**
 * Multi-step activity logger: pick a category, pick an action, set a quantity,
 * and submit. On submit it records the entry and requests an AI coaching tip.
 * Step UI and accessibility concerns live in the `logger/` sub-components; this
 * component owns the flow state and side effects.
 */
export function ActivityLogger() {
  const addEntry = useCarbonStore((s) => s.addEntry);
  const logEntries = useCarbonStore((s) => s.logEntries);

  const [category, setCategory] = useState<Category | null>(null);
  const [action, setAction] = useState<ActionItem | null>(null);
  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);
  const [tip, setTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);

  const preview = useMemo(
    () => (action ? calcCo2(action.co2PerUnit, quantity) : 0),
    [action, quantity]
  );

  const today = useMemo(() => {
    const start = startOfTodayMs();
    return logEntries.filter((e) => new Date(e.timestamp).getTime() >= start);
  }, [logEntries]);

  const handleSelectCategory = (next: Category) => {
    setCategory(next);
    setAction(null);
    setTip(null);
  };

  const handleSelectAction = (next: ActionItem) => {
    setAction(next);
    setTip(null);
  };

  const handleSubmit = async () => {
    if (!category || !action || quantity <= 0) return;
    const co2Total = calcCo2(action.co2PerUnit, quantity);
    addEntry({ category, actionKey: action.key, actionName: action.name, quantity, co2Total });

    setLoadingTip(true);
    setTip(null);
    try {
      const data = await postJson<{ tip?: string }>("/api/tip", {
        actionName: action.name,
        quantity,
        co2Total,
        category,
      });
      setTip(
        data ? (data.tip ?? null) : "Logged! Tip service is busy right now — try again shortly."
      );
    } catch {
      setTip("Logged! Tip service is unavailable right now.");
    } finally {
      setLoadingTip(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section className="card" role="region" aria-label="Choose category">
        <h2 className="section-title">1. Choose a category</h2>
        <CategoryPicker selected={category} onSelect={handleSelectCategory} />
      </section>

      {category && (
        <section className="card" role="region" aria-label="Choose action">
          <h2 className="section-title">2. Pick an action</h2>
          <ActionPicker
            category={category}
            selectedKey={action?.key ?? null}
            onSelect={handleSelectAction}
          />
        </section>
      )}

      {action && (
        <section className="card" role="region" aria-label="Set amount and submit">
          <h2 className="section-title">3. Quantity</h2>
          <QuantitySubmit
            action={action}
            quantity={quantity}
            preview={preview}
            submitting={loadingTip}
            onQuantityChange={setQuantity}
            onSubmit={handleSubmit}
          />
        </section>
      )}

      {(loadingTip || tip) && <CoachTip loading={loadingTip} tip={tip} />}

      <section className="card" role="region" aria-label="Today's log">
        <h2 className="section-title">Today&apos;s log</h2>
        <TodayLog entries={today} />
      </section>
    </div>
  );
}
