import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Sparkles } from "lucide-react"

export default function ApiKeyErrorPage() {
  return (
    <main className="gradient-bg flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-gray-200 shadow-lg rounded-xl">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-center text-gray-800">API Key Error</CardTitle>
            <CardDescription className="text-center">
              The Gemini API key is not properly configured in the environment variables.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Please make sure you've added the <code className="bg-red-50 px-1 py-0.5 rounded">GEMINI_API_KEY</code>{" "}
              environment variable to your project.
            </p>
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
              <h3 className="font-medium text-amber-800 mb-1">How to fix this:</h3>
              <ol className="list-decimal list-inside text-sm space-y-1 text-amber-700">
                <li>Go to your project settings in Vercel</li>
                <li>Navigate to the Environment Variables section</li>
                <li>Add a new variable named GEMINI_API_KEY</li>
                <li>Set its value to your Gemini API key from Google AI Studio</li>
                <li>Redeploy your application</li>
              </ol>
            </div>
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-1">Note about Gemini API:</h3>
              <p className="text-sm text-blue-700">
                Some Gemini models might not be available for all API keys. If you want to try the application without
                setting up an API key, you can use the offline mode.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/" className="w-1/2 mr-2">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full">Try Again</Button>
            </Link>
            <Link href="/chat?offline=true" className="w-1/2 ml-2">
              <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-100 rounded-full">
                Use Offline Mode
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <div className="mt-4 text-center text-sm text-gray-500">
          <div className="flex justify-center items-center">
            <Sparkles className="h-3 w-3 mr-1 text-purple-600" />
            <span>BookBot - AI Book Recommendation Companion</span>
          </div>
        </div>
      </div>
    </main>
  )
}
