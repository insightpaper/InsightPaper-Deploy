import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// GET handler
export async function GET(): Promise<NextResponse> {
  try {
    const cookiesStore = await cookies();
    const jwt = cookiesStore.get("auth")?.value;

    if (!jwt) {
      return NextResponse.json({ message: "Token not found" }, { status: 401 });
    }

    return NextResponse.json({ jwt });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 400 }
    );
  }
}

// DELETE handler
export async function DELETE(): Promise<NextResponse> {
  try {
    const cookiesStore = await cookies();

    // Setting expired cookies instead of deleting (fixes potential issues)
    cookiesStore.set("auth", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    cookiesStore.set("refresh", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return NextResponse.json({ message: "Sesión finalizada" });
  } catch (error) {
    console.error("Error in DELETE /api/cookies:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
