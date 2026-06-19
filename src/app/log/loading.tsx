/** Route-level skeleton shown while the page streams in. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading log activity">
      <div className="skeleton" style={{ height: 32, width: 220, marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 140, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 220, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 120 }} />
    </div>
  );
}
