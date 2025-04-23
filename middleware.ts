import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if the API key is set when accessing the chat page
  if (request.nextUrl.pathname === "/chat") {
    const apiKey = process.env.GEMINI_API_KEY

    // Log for debugging
    console.log("Middleware check - API key available:", !!apiKey)

    // If no API key is set, redirect to an error page
    if (!apiKey) {
      return NextResponse.redirect(new URL("/api-key-error", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/chat"],
}
