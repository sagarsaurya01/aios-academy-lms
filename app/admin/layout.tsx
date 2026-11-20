import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import ConsoleChrome from "@/components/ConsoleChrome";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await currentUser();
  if (!me) redirect("/login");
  if (me.role !== "admin") redirect("/");
  return <ConsoleChrome user={{ name: me.name, role: me.role }}>{children}</ConsoleChrome>;
}
