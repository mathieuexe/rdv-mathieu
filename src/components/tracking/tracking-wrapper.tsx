import { getPublicUserSession } from "@/lib/auth";
import { DynamicTracker } from "./dynamic-tracker";

export async function TrackingWrapper() {
  const session = await getPublicUserSession();
  return <DynamicTracker userId={session.userId || undefined} />;
}
