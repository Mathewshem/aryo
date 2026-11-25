"use client";
import { Suspense } from "react";
import { UsersRound, KeyRound, UserX, UserCheck } from "lucide-react";
import ResourcePage, { DetailRows } from "@/components/admin/ResourcePage";
import Avatar from "@/lib/ui/Avatar";
import { useMe } from "@/components/admin/MeContext";
import { api } from "@/lib/ui/api";
import { alertBox, confirmBox, toast } from "@/lib/ui/dialogs";
import { fmtDateTime } from "@/components/admin/fmt";

const showTemp = (res) => res?.tempPassword && alertBox(`Email could not be sent, so share this temporary password with them directly:\n\n${res.tempPassword}\n\nThey'll be asked to change it when they sign in.`, { title: "Temporary password" });

function Page() {
  const { me } = useMe();
  const admin = me.role === "admin";
  const fields = [
    { key: "avatar_url", label: "Profile picture", type: "photo", folder: "staff", size: 84 },
    { key: "name", label: "Full name", required: true, half: true },
    { key: "email", label: "Email (used to sign in)", type: "email", required: true, half: true, hidden: (f) => !!f.id },
    { key: "title", label: "Job title", half: true, placeholder: "e.g. Bookings manager" },
    { key: "phone", label: "Phone", half: true },
    { key: "role", label: "Role", type: "select", required: true, half: true, options: [{ value: "staff", label: "Staff — edit content & handle bookings" }, { value: "admin", label: "Admin — full control" }] },
    { key: "active", label: "Account active", type: "toggle", half: true, hidden: (f) => !f.id },
  ];
  const resetPw = async (r) => {
    if (!(await confirmBox(`Reset ${r.name}'s password? They'll get a new temporary password by email.`, { danger: false, confirmLabel: "Reset password" }))) return;
    try { const res = await api(`/api/admin/staff/${r.id}`, { method: "PATCH", body: { resetPassword: true } }); toast("Password reset"); showTemp(res); } catch (e) { toast(e.message, "bad"); }
  };
  return (
    <ResourcePage resource="staff" endpoint="/api/admin/staff" title="Staff" singular="Staff member" icon={<UsersRound size={15} />}
      subtitle={admin ? "People who can sign in to this dashboard. New members get a temporary password by email." : "Your team. Only admins can add or change accounts."}
      canCreate={admin} readOnly={!admin} defaults={{ role: "staff", active: true }} fields={fields} searchKeys={["name", "email", "title"]}
      tabs={[{ value: "admin", label: "Admins" }, { value: "staff", label: "Staff" }]} tabKey="role" onSaved={(res) => showTemp(res)}
      columns={[
        { label: "Member", render: (r) => <div className="flex items-center gap-3"><Avatar src={r.avatar_url} name={r.name} size={34} /><div><div className="font-semibold">{r.name}{r.id === me.id && <span className="t-faint font-normal"> (you)</span>}</div><div className="text-[11px] t-muted">{r.email}</div></div></div> },
        { label: "Title", render: (r) => r.title || <span className="t-faint">—</span> },
        { label: "Role", render: (r) => <span className={`pill ${r.role === "admin" ? "pill-gold" : "pill-info"}`}>{r.role}</span> },
        { label: "Last sign-in", render: (r) => r.last_login ? fmtDateTime(r.last_login) : <span className="t-faint">Never</span> },
        { label: "Status", render: (r) => !r.active ? <span className="pill pill-mute">Inactive</span> : r.must_change_password ? <span className="pill pill-warn">Invited</span> : <span className="pill pill-ok">Active</span> },
      ]}
      extraActions={(r, { patch }) => admin && r.id !== me.id ? [
        { label: "Reset password", icon: KeyRound, onClick: () => resetPw(r) },
        { label: r.active ? "Deactivate" : "Reactivate", icon: r.active ? UserX : UserCheck, onClick: () => patch(r, { active: !r.active }) },
      ] : []}
      renderView={(r) => (<div>
        <div className="flex items-center gap-4 mb-5"><Avatar src={r.avatar_url} name={r.name} size={76} ring /><div><div className="text-[18px] font-semibold">{r.name}</div><div className="t-muted">{r.title || r.role}</div></div></div>
        <DetailRows rows={[["Email", r.email], ["Phone", r.phone], ["Role", r.role], ["Last sign-in", r.last_login ? fmtDateTime(r.last_login) : "Never"], ["Member since", fmtDateTime(r.created_at)]]} />
      </div>)} />
  );
}
export default function StaffPage() { return <Suspense><Page /></Suspense>; }
