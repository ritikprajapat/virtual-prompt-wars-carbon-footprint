"use client";
import { useEffect } from "react";

/** Route-level error boundary; logs the error and offers a retry. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" style={{ textAlign: "center", padding: "64px 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Something went wrong</h1>
      <p style={{ color: "var(--text2)", marginBottom: 24 }}>
        An unexpected error occurred. Your logged data is safe.
      </p>
      <button className="btn-primary" onClick={reset} aria-label="Try again">
        Try again
      </button>
    </div>
  );
}
