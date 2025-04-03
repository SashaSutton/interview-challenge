import { NextResponse, NextRequest } from "next/server";
import { TOKEN_COOKIE } from "./app/constants";
import { generateTokenForNewUser } from "./app/auth";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.cookies.has(TOKEN_COOKIE)) {
    return NextResponse.next();
  }

  // Create new cookie
  const token = generateTokenForNewUser();

  const response = NextResponse.next();
  response.cookies.set(TOKEN_COOKIE, token, { httpOnly: true, path: "/" });
  return response;
}
