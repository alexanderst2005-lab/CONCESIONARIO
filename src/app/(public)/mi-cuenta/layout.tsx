import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function MiCuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
