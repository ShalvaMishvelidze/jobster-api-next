import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "This is an api for Jobster mobile app!",
  });
}
