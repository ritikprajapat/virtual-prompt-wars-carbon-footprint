"use client";
import type { ActionItem } from "@/types";

interface QuantitySubmitProps {
  action: ActionItem;
  quantity: number;
  preview: number;
  submitting: boolean;
  onQuantityChange: (quantity: number) => void;
  onSubmit: () => void;
}

/** Minimum loggable quantity. */
const MIN_QUANTITY = 0.5;
/** Maximum loggable quantity (mirrors the server-side validator). */
const MAX_QUANTITY = 10000;
/** Quantity stepper increment. */
const QUANTITY_STEP = 0.5;

/**
 * Quantity input with a live CO₂ preview and the submit button for logging an
 * activity. Purely presentational — all state is owned by the parent.
 */
export function QuantitySubmit({
  action,
  quantity,
  preview,
  submitting,
  onQuantityChange,
  onSubmit,
}: QuantitySubmitProps) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="field-label">Quantity ({action.unit})</span>
          <input
            type="number"
            className="input"
            aria-label={`Quantity in ${action.unit}`}
            min={MIN_QUANTITY}
            max={MAX_QUANTITY}
            step={QUANTITY_STEP}
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            style={{ width: 120 }}
          />
        </label>
        <div aria-live="polite" style={{ fontSize: 14 }}>
          <span style={{ color: "var(--text2)" }}>Estimated: </span>
          <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 20, color: "var(--green)" }}>
            {preview} kg CO₂
          </span>
        </div>
      </div>
      <button
        className="btn-primary"
        onClick={onSubmit}
        disabled={submitting}
        aria-label="Log activity"
        style={{ marginTop: 16 }}
      >
        Log Activity
      </button>
    </>
  );
}
