import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/resend";

export async function POST(request: Request) {
  const { name, email, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Tum alanlar gereklidir" },
      { status: 400 }
    );
  }

  try {
    await sendContactEmail({ name, email, message });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Email gonderilemedi" },
      { status: 500 }
    );
  }
}
