import { NextResponse } from "next/server";
import { getConnectedProfiles } from "@/lib/uploadpost";

export async function GET() {
  try {
    const profiles = await getConnectedProfiles();
    return NextResponse.json({ profiles });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
