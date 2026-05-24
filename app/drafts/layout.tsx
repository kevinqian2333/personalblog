import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function DraftsLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (token !== "admin_authenticated") {
    redirect("/login?redirect=/drafts");
  }

  return <>{children}</>;
}
