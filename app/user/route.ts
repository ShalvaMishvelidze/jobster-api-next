import { prisma } from "@/lib/prisma";
import { comparePassword, createJWT, validateJWT } from "@/utils/helpers";
import {
  areValidUserFields,
  isValidEmail,
  isValidPassword,
} from "@/utils/validators";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const email = searchParams.get("email");
  const password = searchParams.get("password");

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  if (isValidEmail(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email!" }, { status: 401 });
    }

    if (!comparePassword(password, user?.password)) {
      return NextResponse.json(
        { error: "Invalid password for this email!" },
        { status: 401 }
      );
    }

    const jwt = createJWT({ id: user.id, name: user.name, email: user.email });

    return NextResponse.json(
      { message: "Success!", token: jwt },
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

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email and password are required" },
      { status: 400 }
    );
  }

  if (isValidEmail(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  if (isValidPassword(password)) {
    return NextResponse.json(
      { error: "Invalid password format" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });

    const jwt = await createJWT({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return NextResponse.json(
      { message: "Success!", token: jwt },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { name, lastName, email, location } = await req.json();
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Authorization token is required" },
      { status: 401 }
    );
  }

  try {
    const payload = (await validateJWT(token)) as { id: string };

    if (isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!areValidUserFields(name, lastName, location)) {
      return NextResponse.json(
        { error: "Invalid user fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: {
        id: payload.id,
      },
      data: {
        name,
        email,
        lastName,
        location,
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
      { message: "Success!", token: jwt },
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

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Authorization token is required" },
      { status: 401 }
    );
  }

  try {
    const payload = (await validateJWT(token)) as { id: string };

    await prisma.user.delete({
      where: {
        id: payload.id,
      },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
