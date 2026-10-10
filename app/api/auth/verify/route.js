import { NextResponse } from "next/server";
import { checkPasscode, createSessionToken, COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { passcode } = body || {};

    if (!passcode || typeof passcode !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter the passcode." },
        { status: 400 }
      );
    }

    const isValid = checkPasscode(passcode);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect passcode. Please try again." },
        { status: 401 }
      );
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication service error. Please try again." },
      { status: 500 }
    );
  }
}
