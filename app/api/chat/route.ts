import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Get API key from environment variable
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    // Log for debugging (will be visible in Vercel logs)
    console.log("API Key available:", !!GEMINI_API_KEY)

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Format the conversation for the AI
    let prompt = ""

    if (messages[0].content === "Start the BookBot introduction") {
      // For the initial greeting
      prompt =
        "Please provide a warm greeting as BookBot and explain that you'll ask 4 questions to understand the user's book preferences."
    } else {
      // For regular conversation
      prompt = messages.map((msg: any) => `${msg.role === "user" ? "User" : "BookBot"}: ${msg.content}`).join("\n")
    }

    // Create the system prompt with the BookBot instructions
    const systemPrompt = `You are "BookBot", an AI book companion that helps users discover books tailored to their preferences.

**Step 1 – User Onboarding:**
Greet the user warmly and let them know you'll ask them 4 quick multiple-choice questions to understand their taste in books.

**Step 2 – Preference Questions:**
Ask the user the following questions one at a time, each with four unique answer choices. After each answer, store the result for profiling:

1. What type of stories do you usually enjoy?
   - A. Mysteries and Thrillers
   - B. Romance and Emotions
   - C. Science Fiction or Fantasy
   - D. Non-fiction and Real Events

2. What kind of pacing do you prefer in a book?
   - A. Fast and action-packed
   - B. Slow and reflective
   - C. Balanced with surprises
   - D. Depends on the topic

3. Which setting appeals to you the most?
   - A. Modern cities or urban life
   - B. Historical or classical worlds
   - C. Futuristic or magical realms
   - D. Real-life memoirs or biographies

4. Why do you read books?
   - A. To escape reality and be thrilled
   - B. To feel, reflect, and relate
   - C. To explore new worlds and possibilities
   - D. To learn and grow from real-life experiences

**Step 3 – Book Recommendation:**
After all questions are answered, analyze the user's profile and provide a list of **3 to 5 book recommendations** (title + author + one-sentence summary). Include a mix of popular and lesser-known titles that fit their answers.

**Step 4 – Book Discussion:**
Encourage the user to pick a book from the list. Then, have a chat about it:
- Offer a short spoiler-free synopsis.
- Share what others have said about it (as if from reviews).
- Ask the user if they want to discuss themes, characters, or similar books.

Maintain a friendly, thoughtful, and slightly witty tone throughout.`

    // Use gemini-pro model which is known to be available
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    // Construct the request body
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    }

    // Make the API request with proper error handling
    const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    // Handle API response
    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API error:", JSON.stringify(errorData))

      // Try a fallback response if the API fails
      if (messages[0].content === "Start the BookBot introduction") {
        return NextResponse.json({
          text: "Hi! I'm BookBot, your AI book companion. I'll help you discover books tailored to your preferences. Let me ask you a few questions to understand your taste better.",
        })
      }

      return NextResponse.json(
        { error: errorData.error?.message || "Error generating response" },
        { status: response.status },
      )
    }

    const data = await response.json()
    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response."

    return NextResponse.json({ text: generatedText })
  } catch (error) {
    console.error("Error in chat API:", error)

    // Provide a fallback response for the initial greeting
    try {
      const { messages } = await request.json()
      if (messages && messages[0]?.content === "Start the BookBot introduction") {
        return NextResponse.json({
          text: "Hi! I'm BookBot, your AI book companion. I'll help you discover books tailored to your preferences. Let me ask you a few questions to understand your taste better.",
        })
      }
    } catch (e) {
      console.error("Error parsing request body:", e)
    }

    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
