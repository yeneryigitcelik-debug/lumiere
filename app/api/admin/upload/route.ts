import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveFile, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, getFileType } from "@/lib/upload";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string;

  if (!file) {
    return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Dosya boyutu 10MB'i asamaz" },
      { status: 400 }
    );
  }

  const fileType = getFileType(file.name);

  if (fileType === "image" && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Desteklenmeyen dosya tipi" },
      { status: 400 }
    );
  }

  const subDir =
    type === "blog"
      ? "blog"
      : fileType === "model"
        ? "products/models"
        : "products/images";

  const url = await saveFile(file, subDir);

  return NextResponse.json({ url });
}
