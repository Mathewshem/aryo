import { redirect } from "next/navigation";
// Internal system: everything lives behind the staff sign-in.
export default function Home() { redirect("/admin"); }
