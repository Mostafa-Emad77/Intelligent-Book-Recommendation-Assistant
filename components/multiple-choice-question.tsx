"use client"

import { Button } from "@/components/ui/button"

interface MultipleChoiceQuestionProps {
  question: string
  options: string[]
  onSelect: (option: string) => void
}

export default function MultipleChoiceQuestion({ question, options, onSelect }: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-3">
      <p className="font-medium">{question}</p>
      <div className="space-y-2">
        {options.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start text-left border-gray-200 hover:bg-purple-50 hover:text-purple-800 rounded-lg py-3 px-4 text-gray-700"
            onClick={() => onSelect(option)}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  )
}
