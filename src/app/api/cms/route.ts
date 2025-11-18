import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { cmsSchema } from "@/lib/validation";
import { getCmsData, saveCmsData } from "@/lib/dataStore";
import { sessionCookieName } from "@/lib/auth-shared";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getCmsData();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(sessionCookieName);
    if (!cookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = await request.json();
    const parsed = cmsSchema.parse(payload);
    await saveCmsData(parsed);
    revalidatePath("/", "layout");
    revalidatePath("/sublets");
    revalidatePath("/cars");
    revalidatePath("/contact");
    revalidatePath("/admin", "page");
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Admin save failed", error);
    return NextResponse.json({ message: "Invalid payload", details: `${error}` }, { status: 400 });
  }
}
