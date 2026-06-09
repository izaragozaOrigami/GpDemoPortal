import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/buzon/auth";
import BuzonApp from "./BuzonApp";

export const dynamic = "force-dynamic";

export default async function BuzonPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <BuzonApp user={user} />;
}
