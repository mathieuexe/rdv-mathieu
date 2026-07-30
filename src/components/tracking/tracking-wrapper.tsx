import { getPublicUserSession } from "@/lib/auth";
import { Tracker } from "./tracker";

export async function TrackingWrapper() {
  const session = await getPublicUserSession();
  return <Tracker userId={session.userId || undefined} />;
}
