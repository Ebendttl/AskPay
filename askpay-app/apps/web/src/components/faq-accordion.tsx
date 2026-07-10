"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export interface FAQItem {
  question: string
  answer: React.ReactNode
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3 w-full max-w-3xl mx-auto">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div
            key={index}
            className="group border border-border rounded-xl bg-card/60 backdrop-blur-sm transition-all duration-200 hover:border-primary/40 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between p-5 text-left font-semibold text-foreground transition-colors hover:text-primary"
              aria-expanded={isOpen}
            >
              <span className="pr-4">{item.question}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:text-primary ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>
            <div
              className={`grid transition-all duration-200 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-5 pt-4 text-sm text-muted-foreground border-t border-border/40 leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
