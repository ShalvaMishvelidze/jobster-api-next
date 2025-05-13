import { prisma } from "@/lib/prisma";
import { comparePassword, createJWT } from "@/utils/helpers";
import { isValidEmail } from "@/utils/validators";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email!" }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user?.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid password for this email!" },
        { status: 401 }
      );
    }

    const jwt = await createJWT({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return NextResponse.json(
      { message: "User logged in successfully!", token: jwt },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
