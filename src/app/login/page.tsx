import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Admin login | Campkin",
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("campkin_admin");
  if (token) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
      <div className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Admin</p>
        <h1 className="text-3xl font-semibold text-slate-900">Secure dashboard access</h1>
        <p className="text-sm text-slate-500">
          Enter the rotating passcode shared with management. Contact Campkin HQ if you need access.
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-xs text-slate-500">
        Back to <Link className="font-semibold text-slate-900" href="/">campkintrading.co.uk</Link>
      </p>
    </div>
  );
}
