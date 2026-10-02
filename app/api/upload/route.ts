import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // 10MB server limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 }
      );
    }

    // Clean extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const fileName = `bg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;

    const arrayBuffer = await file.arrayBuffer();

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/invitation-backgrounds/${fileName}`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": file.type || "image/jpeg",
        },
        body: arrayBuffer,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("Supabase storage upload error:", errText);
      return NextResponse.json({ error: "Failed to upload image to cloud storage" }, { status: 500 });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/invitation-backgrounds/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
