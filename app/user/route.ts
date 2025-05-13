import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createJWT, validateJWT } from "@/utils/helpers";
import { areValidUserFields, isValidEmail } from "@/utils/validators";

export async function GET(req: NextRequest) {
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Authorization token is required" },
      { status: 401 }
    );
  }

  try {
    const payload = (await validateJWT(token)) as { id: string };

    const user = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }

    const returnUser = {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      location: user.location,
    };

    const jwt = await createJWT({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return NextResponse.json(
      { message: "User fetched successfully!", user: returnUser, token: jwt },
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

    if (!isValidEmail(email)) {
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
      { message: "User updated successfully!", token: jwt },
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

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
