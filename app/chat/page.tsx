import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import ChatInterface from "@/components/chat-interface"

export default function ChatPage() {
  const cookieStore = cookies()
  const apiKey = process.env.GEMINI_API_KEY
  const offlineMode = cookieStore.get("offline_mode")?.value === "true"

  // If no API key and not in offline mode, redirect to error page
  if (!apiKey && !offlineMode) {
    redirect("/api-key-error")
  }

  return (
    <main className="gradient-bg min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 md:p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <div className="sparkle">✦</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Ask BookBot anything</h1>
        </div>
        <div className="flex-1 flex flex-col">
          <ChatInterface />
        </div>
      </div>
    </main>
  )
}
