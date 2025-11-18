import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCmsData } from "@/lib/dataStore";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { sessionCookieName } from "@/lib/auth-shared";

export const metadata = {
  title: "Admin | Campkin",
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName);
  if (!token) {
    redirect("/login?redirect=/admin");
  }
  const data = await getCmsData();

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-4xl font-bold text-slate-900">Content management</h1>
      <p className="text-sm text-slate-500">
        Update hero content, unit availability and vehicle listings. Changes persist to the JSON datastore for this prototype.
      </p>
      <AdminDashboard initialData={data} />
    </div>
  );
}
