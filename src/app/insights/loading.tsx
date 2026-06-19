/** Route-level skeleton shown while the page streams in. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading insights">
      <div className="skeleton" style={{ height: 32, width: 180, marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 240, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 160, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 140 }} />
    </div>
  );
}
