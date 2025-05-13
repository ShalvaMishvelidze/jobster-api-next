import { prisma } from "@/lib/prisma";
import {
  comparePassword,
  createJWT,
  hashPassword,
  validateJWT,
} from "@/utils/helpers";
import { isValidPassword } from "@/utils/validators";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const { newPassword, oldPassword } = await req.json();

  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Authorization token is required" },
      { status: 401 }
    );
  }

  try {
    const payload = (await validateJWT(token)) as { id: string };

    if (!isValidPassword(newPassword)) {
      return NextResponse.json(
        { error: "Invalid password format" },
        { status: 400 }
      );
    }

    const oldUser = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!oldUser) {
      return NextResponse.json({ message: "No user found!" }, { status: 404 });
    }

    const isMatch = await comparePassword(oldPassword, oldUser.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Old password does not match!" },
        { status: 401 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    const user = await prisma.user.update({
      where: {
        id: payload.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    const jwt = await createJWT({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return NextResponse.json(
      { message: "Password updated successfully!", token: jwt },
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
