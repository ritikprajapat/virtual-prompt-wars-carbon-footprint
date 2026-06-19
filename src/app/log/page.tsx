import { ActivityLogger } from "@/components/ActivityLogger";

/** Log route: hosts the multi-step {@link ActivityLogger}. */
export default function LogPage() {
  return (
    <div>
      <h1 className="page-title">Log Activity</h1>
      <p className="page-sub">Record an action and get an instant AI tip to cut its footprint</p>
      <ActivityLogger />
    </div>
  );
}
