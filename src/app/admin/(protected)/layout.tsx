import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import AdminSidebar from "./AdminSidebar";
import styles from "./layout.module.css";

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  // Verificar si es ADMIN
  const userRecord = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!userRecord || userRecord.role !== "ADMIN") {
    redirect("/mi-cuenta"); // Redirigir a panel normal si no es admin
  }

  return (
    <div className={`container ${styles.adminContainer}`}>
      <AdminSidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
