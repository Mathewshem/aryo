import { redirect } from "next/navigation";
import { getStaff } from "@/lib/server/session";
import Shell from "@/components/admin/Shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }) {
  const staff = await getStaff();
  if (!staff || staff.must_change_password) redirect("/admin/login");
  return <Shell me={staff}>{children}</Shell>;
}
