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

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nipdwmdwugipjmrmhagb.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcGR3bWR3dWdpcGptcm1oYWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNDc5MDksImV4cCI6MjA5ODgyMzkwOX0.nm6ng1Zbo6ZU2b8qXU04Hg1eRbF61i24uFSh5vUbcgw";

// GET /api/invitations?id=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing invitation ID" }, { status: 400 });
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/invitations?id=eq.${encodeURIComponent(id)}&select=config`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch invitation" }, { status: 500 });
    }

    const rows = await res.json();
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      config: rows[0].config,
    });
  } catch (error) {
    console.error("GET /api/invitations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/invitations
export async function POST(req: NextRequest) {
  try {
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
