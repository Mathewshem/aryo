import LoginForm from "@/components/admin/LoginForm";
import { getStaff } from "@/lib/server/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function Page() {
  let staff = null;
  try { staff = await getStaff(); } catch {}
  if (staff && !staff.must_change_password) redirect("/admin");
  return <LoginForm />;
}
