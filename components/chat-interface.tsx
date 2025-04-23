"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Sparkles, RefreshCw, Wifi, WifiOff } from "lucide-react"
import MultipleChoiceQuestion from "@/components/multiple-choice-question"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Message = {
  role: "user" | "assistant"
  content: string
  isQuestion?: boolean
  options?: string[]
}

type UserPreference = {
  question1?: string
  question2?: string
  question3?: string
  question4?: string
}

// Offline mode book recommendations based on preferences
const offlineRecommendations: Record<string, string[]> = {
  A: [
    "The Silent Patient by Alex Michaelides - A shocking psychological thriller of a woman's act of violence against her husband.",
    "Gone Girl by Gillian Flynn - A twisted and addictive thriller about a woman's disappearance and the secrets that unravel.",
    "The Da Vinci Code by Dan Brown - A fast-paced mystery thriller that explores religious history and symbology.",
  ],
  B: [
    "Pride and Prejudice by Jane Austen - A classic tale of manners, upbringing, morality, education, and marriage in British Regency society.",
    "The Notebook by Nicholas Sparks - A poignant story of love lost and found, spanning decades and testing the limits of devotion.",
    "Normal People by Sally Rooney - An exquisite story about how one person can change another person's life.",
  ],
  C: [
    "Dune by Frank Herbert - An epic science fiction masterpiece of adventure and mysticism on a desert planet.",
    "The Name of the Wind by Patrick Rothfuss - A richly detailed fantasy about a legendary wizard recounting his life story.",
    "Project Hail Mary by Andy Weir - A lone astronaut must save humanity from extinction through interstellar cooperation.",
  ],
  D: [
    "Sapiens by Yuval Noah Harari - A groundbreaking narrative of humanity's creation and evolution exploring how biology and history have defined us.",
    "Educated by Tara Westover - A memoir about a woman who leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
    "The Immortal Life of Henrietta Lacks by Rebecca Skloot - The story of a woman whose cells were used for medical research without her knowledge.",
  ],
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [userPreferences, setUserPreferences] = useState<UserPreference>({})
  const [error, setError] = useState<string | null>(null)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const questions = [
    {
      question: "What type of stories do you usually enjoy?",
      options: [
        "A. Mysteries and Thrillers",
        "B. Romance and Emotions",
        "C. Science Fiction or Fantasy",
        "D. Non-fiction and Real Events",
      ],
    },
    {
      question: "What kind of pacing do you prefer in a book?",
      options: [
        "A. Fast and action-packed",
        "B. Slow and reflective",
        "C. Balanced with surprises",
        "D. Depends on the topic",
      ],
    },
    {
      question: "Which setting appeals to you the most?",
      options: [
        "A. Modern cities or urban life",
        "B. Historical or classical worlds",
        "C. Futuristic or magical realms",
        "D. Real-life memoirs or biographies",
      ],
    },
    {
      question: "Why do you read books?",
      options: [
        "A. To escape reality and be thrilled",
        "B. To feel, reflect, and relate",
        "C. To explore new worlds and possibilities",
        "D. To learn and grow from real-life experiences",
      ],
    },
  ]

  // Function to call our server-side API
  async function generateChatResponse(messages: Message[]): Promise<string> {
    try {
      setError(null)

      // If in offline mode, use offline responses
      if (isOfflineMode) {
        return generateOfflineResponse(messages)
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate response")
      }

      const data = await response.json()
      return data.text
    } catch (error) {
      console.error("Error generating chat response:", error)
      setError(error instanceof Error ? error.message : "Failed to generate response")

      // Switch to offline mode if there's an API error
      if (!isOfflineMode) {
        setIsOfflineMode(true)
        return generateOfflineResponse(messages)
      }

      return "I'm sorry, I encountered an error while generating a response. I've switched to offline mode to continue helping you."
    }
  }

  // Generate offline responses based on the conversation
  function generateOfflineResponse(messages: Message[]): string {
    // Initial greeting
    if (messages[0].content === "Start the BookBot introduction") {
      return "Hi! I'm BookBot, your AI book companion. I'm currently in offline mode, but I can still help you discover books tailored to your preferences. Let me ask you a few questions to understand your taste better."
    }

    // Generate recommendations based on the first question's answer
    if (
      messages.length > 0 &&
      messages[0].role === "user" &&
      messages[0].content.startsWith("Based on these preferences")
    ) {
      const firstPreference = userPreferences.question1 || ""
      const category = firstPreference.charAt(0) // Get the letter A, B, C, or D

      const recommendations = offlineRecommendations[category] || offlineRecommendations["C"]

      return `Based on your preferences, here are some book recommendations that you might enjoy:

${recommendations.join("\n\n")}

Would you like to know more about any of these books? Just ask me about the one that interests you the most!`
    }

    // For other questions, provide a generic response
    return "I'm in offline mode right now, but I'm still here to help with book recommendations. Feel free to ask me about any of the books I've suggested!"
  }

  // Reset function to start over
  const handleReset = () => {
    setMessages([])
    setCurrentStep(0)
    setUserPreferences({})
    setError(null)
    setIsLoading(true)

    // Start the initial greeting again
    initialMessage()
  }

  // Toggle offline mode
  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode)
    setError(null)
    handleReset()
  }

  // Initial greeting function
  const initialMessage = async () => {
    setIsLoading(true)
    try {
      console.log("Generating initial message...")
      const response = await generateChatResponse([{ role: "user", content: "Start the BookBot introduction" }])
      console.log("Initial message generated:", response)
      setMessages([{ role: "assistant", content: response }])
      setCurrentStep(1)
    } catch (error) {
      console.error("Error generating initial message:", error)
      setMessages([
        {
          role: "assistant",
          content:
            "Hi! I'm BookBot, your AI book companion. I'll help you discover books tailored to your preferences. Let me ask you a few questions to understand your taste better.",
        },
      ])
      setCurrentStep(1)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    initialMessage()
  }, [])

  useEffect(() => {
    // Ask the current question if we're in the question phase
    if (currentStep >= 1 && currentStep <= 4 && !isLoading) {
      const currentQuestion = questions[currentStep - 1]
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: currentQuestion.question,
          isQuestion: true,
          options: currentQuestion.options,
        },
      ])
    }
  }, [currentStep, isLoading])

  useEffect(() => {
    // Generate recommendations after all questions are answered
    const generateRecommendations = async () => {
      if (currentStep === 5) {
        setIsLoading(true)
        try {
          const promptMessages = [
            {
              role: "user",
              content: `Based on these preferences:
              Question 1: ${userPreferences.question1}
              Question 2: ${userPreferences.question2}
              Question 3: ${userPreferences.question3}
              Question 4: ${userPreferences.question4}
              
              Please provide 3-5 book recommendations with title, author, and a one-sentence summary for each.`,
            },
          ]

          const response = await generateChatResponse(promptMessages)
          setMessages((prev) => [...prev, { role: "assistant", content: response }])
        } catch (error) {
          console.error("Error generating recommendations:", error)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "I'm sorry, I couldn't generate recommendations at the moment. Please try again later.",
            },
          ])
        } finally {
          setIsLoading(false)
        }
      }
    }

    generateRecommendations()
  }, [currentStep, userPreferences])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleOptionSelect = (option: string) => {
    if (currentStep >= 1 && currentStep <= 4) {
      setMessages((prev) => [...prev, { role: "user", content: option }])

      // Store the user's preference
      setUserPreferences((prev) => ({
        ...prev,
        [`question${currentStep}`]: option,
      }))

      // Move to the next step
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      // Create conversation history for the AI
      const conversationHistory = messages
        .filter((msg) => !msg.isQuestion)
        .map((msg) => ({ role: msg.role, content: msg.content }))

      const response = await generateChatResponse([...conversationHistory, { role: "user", content: userMessage }])

      setMessages((prev) => [...prev, { role: "assistant", content: response }])
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I couldn't process your request. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col overflow-hidden rounded-xl bg-white shadow-lg">
        {error && (
          <div className="bg-red-50 border-b border-red-200 p-3 text-red-700 text-sm flex justify-between items-center">
            <div>
              <span className="font-medium">Error:</span> {error}
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-red-700">
              <RefreshCw className="h-4 w-4 mr-1" /> Retry
            </Button>
          </div>
        )}

        {isOfflineMode && (
          <Alert className="bg-amber-50 border-amber-200 rounded-none">
            <WifiOff className="h-4 w-4 text-amber-800" />
            <AlertDescription className="text-amber-800">
              Running in offline mode. Some features may be limited.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} items-start`}
            >
              {message.role === "assistant" && (
                <div className="bg-purple-600 text-white rounded-full p-2 mr-2 flex-shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div
                className={
                  message.isQuestion
                    ? "bg-white rounded-xl p-4 shadow-sm max-w-[80%]"
                    : message.role === "user"
                      ? "bg-white rounded-xl p-4 shadow-sm max-w-[80%]"
                      : "bg-white rounded-xl p-4 shadow-sm max-w-[80%]"
                }
              >
                {message.role !== "user" && !message.isQuestion && (
                  <div className="text-xs text-gray-500 mb-1">BOOKBOT</div>
                )}
                {message.role === "user" && <div className="text-xs text-gray-500 mb-1">YOU</div>}
                {message.isQuestion ? (
                  <MultipleChoiceQuestion
                    question={message.content}
                    options={message.options || []}
                    onSelect={handleOptionSelect}
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
              {message.role === "user" && (
                <div className="bg-gray-200 rounded-full p-2 ml-2 flex-shrink-0">
                  <div className="h-4 w-4 flex items-center justify-center text-xs font-bold">Y</div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start items-start">
              <div className="bg-purple-600 text-white rounded-full p-2 mr-2 flex-shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm max-w-[80%]">
                <div className="text-xs text-gray-500 mb-1">BOOKBOT</div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 rounded-full bg-purple-600 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-purple-600 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-purple-600 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a book recommendation..."
              className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={currentStep < 5 || isLoading}
            />
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 h-auto"
              disabled={currentStep < 5 || isLoading}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500 flex items-center">
          <Sparkles className="h-4 w-4 mr-1 text-purple-600" />
          <span>BookBot - AI Book Recommendation Companion</span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleOfflineMode}
            className="text-gray-600 border-gray-200 hover:bg-gray-100 rounded-full text-xs px-3"
          >
            {isOfflineMode ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOfflineMode ? "Online Mode" : "Offline Mode"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-gray-600 border-gray-200 hover:bg-gray-100 rounded-full text-xs px-3"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Start Over
          </Button>
        </div>
      </div>
    </div>
  )
}
