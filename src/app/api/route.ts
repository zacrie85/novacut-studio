import { NextResponse } from "next/server";

// agar kompatibel dengan static export (build desktop)
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}