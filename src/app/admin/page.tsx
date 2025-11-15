import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { getCmsData } from "@/lib/dataStore";

// Code split admin dashboard for smaller initial bundle
const AdminDashboard = dynamic(() => import("@/components/admin/admin-dashboard").then((mod) => ({ default: mod.AdminDashboard })), {
  loading: () => <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>,
});

export const metadata = {
  title: "Admin | Campkin",
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("campkin_admin");
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
