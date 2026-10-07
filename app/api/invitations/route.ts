import { NextRequest, NextResponse } from "next/server";
import os from "os";

function getLocalLanIp(): string | null {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      const netList = interfaces[name] || [];
      for (const net of netList) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // Prefer common home/office Wi-Fi ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        if (net.family === "IPv4" && !net.internal) {
          if (
            net.address.startsWith("192.168.") ||
            net.address.startsWith("10.") ||
            net.address.startsWith("172.")
          ) {
            return net.address;
          }
        }
      }
    }
  } catch {
    // Ignore error
  }
  return null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// GET /api/invitations?id=... or ?ids=id1,id2,...
export async function GET(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");

    if (ids) {
      const idList = ids.split(",").map((s) => s.trim()).filter(Boolean);
      if (idList.length === 0) {
        return NextResponse.json({ success: true, invitations: [] });
      }
      const inFilter = `(${idList.map(encodeURIComponent).join(",")})`;
      const res = await fetch(
        `${supabaseUrl}/rest/v1/invitations?id=in.${inFilter}&select=id,config,answers,created_at,updated_at`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 });
      }

      const rows = await res.json();
      return NextResponse.json({
        success: true,
        invitations: rows.map(
          (r: {
            id: string;
            config: unknown;
            answers: unknown;
            created_at: string;
            updated_at?: string;
          }) => ({
            id: r.id,
            config: r.config,
            answers: r.answers || null,
            createdAt: r.created_at,
            updatedAt: r.updated_at || r.created_at,
          })
        ),
      });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing invitation ID" }, { status: 400 });
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/invitations?id=eq.${encodeURIComponent(id)}&select=id,config,answers,created_at,updated_at`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch invitation" }, { status: 500 });
    }

    const rows = await res.json();
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      id: rows[0].id,
      config: rows[0].config,
      answers: rows[0].answers || null,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at || rows[0].created_at,
    });
  } catch (error) {
    console.error("GET /api/invitations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/invitations
export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { config, customId } = body;

    if (!config) {
      return NextResponse.json({ error: "Missing invitation config" }, { status: 400 });
    }

    // Generate short, clean 8-character ID (alphanumeric lowercase)
    const randomChars = "abcdefghjkmnpqrstuvwxyz23456789";
    let generatedId = "";
    for (let i = 0; i < 8; i++) {
      generatedId += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    const id = customId || generatedId;

    const res = await fetch(`${supabaseUrl}/rest/v1/invitations`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        id,
        config,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Supabase insert invitation error:", errText);
      return NextResponse.json({ error: "Failed to save invitation" }, { status: 500 });
    }

    const lanIp = getLocalLanIp();

    return NextResponse.json({
      success: true,
      id,
      lanIp,
    });
  } catch (error) {
    console.error("POST /api/invitations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/invitations
// Body: { id: string, answers: Record<string, string | string[]> }
export async function PATCH(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { id, answers } = body;

    if (!id || !answers) {
      return NextResponse.json(
        { error: "Missing invitation ID or answers" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/invitations?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          answers,
          updated_at: new Date().toISOString(),
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Supabase update answers error:", errText);
      return NextResponse.json(
        { error: "Failed to record answers" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Answers recorded successfully",
    });
  } catch (error) {
    console.error("PATCH /api/invitations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
