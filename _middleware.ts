import "./src/env.mjs";
import { NextResponse } from "next/server";

export function middleware() {
  console.log(process.env);
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
