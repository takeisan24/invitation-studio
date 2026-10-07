import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isAudio =
      file.type.startsWith("audio/") ||
      /\.(mp3|wav|m4a|ogg|aac|webm)$/i.test(file.name);
    const isImage = file.type.startsWith("image/");

    if (!isAudio && !isImage) {
      return NextResponse.json(
        { error: "File must be an image (PNG, JPG, WebP) or audio (MP3, WAV, M4A)" },
        { status: 400 }
      );
    }

    const bucketName = isAudio ? "invitation-audio" : "invitation-backgrounds";
    const maxLimit = isAudio ? 15 * 1024 * 1024 : 5 * 1024 * 1024;

    if (file.size > maxLimit) {
      return NextResponse.json(
        { error: `File size exceeds ${isAudio ? "15MB" : "5MB"} limit` },
        { status: 400 }
      );
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
    const ext = file.name.split(".").pop()?.toLowerCase() || (isAudio ? "mp3" : "jpg");
    const prefix = isAudio ? "audio" : "bg";
    const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": file.type || (isAudio ? "audio/mpeg" : "image/jpeg"),
        },
        body: arrayBuffer,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("Supabase storage upload error:", errText);
      return NextResponse.json(
        { error: `Failed to upload ${isAudio ? "audio" : "image"} to cloud storage` },
        { status: 500 }
      );
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
