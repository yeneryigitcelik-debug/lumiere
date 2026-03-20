import { NextResponse } from "next/server";
import { saveFile, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/upload";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Dosya boyutu 10MB'i asamaz" },
      { status: 400 }
    );
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Desteklenmeyen dosya tipi" },
      { status: 400 }
    );
  }

  const url = await saveFile(file, "misc");

  return NextResponse.json({ url });
}
