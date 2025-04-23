import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default function Home({ searchParams }: { searchParams: { offline?: string } }) {
  // Check if offline mode is requested
  const offlineMode = searchParams.offline === "true"

  if (offlineMode) {
    // Set a cookie to indicate offline mode and redirect to chat
    cookies().set("offline_mode", "true", { path: "/" })
    redirect("/chat")
  }

  // Check if the API key is set
  const apiKey = process.env.GEMINI_API_KEY

  // If no API key is set, redirect to the error page
  if (!apiKey) {
    redirect("/api-key-error")
  }

  // Otherwise, redirect to the chat page
  redirect("/chat")
}
