"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * ContactForm
 *
 * A controlled contact form for the /contact page.
 *
 * ⚠️  NOT WIRED TO ANY BACKEND YET.
 * Submission currently only logs to the console.
 * Before going live, replace the handleSubmit body with a real API
 * call (e.g. POST /api/contact, Resend, Formspree, etc.) and add
 * proper server-side validation and rate limiting.
 *
 * The form intentionally shows a neutral "pending" state on submit
 * rather than a fake "success" confirmation, so the user is never
 * misled about whether their message was actually delivered.
 */

interface FormState {
  subject: string
  message: string
}

const EMPTY: FormState = { subject: "", message: "" }

export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [pending, setPending] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) return

    setPending(true)

    // ── TODO: replace with a real API call ─────────────────────────────────
    // Example:
    //   await fetch("/api/contact", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(form),
    //   })
    //
    // For now, log the payload and redirect to GitHub Issues so the
    // user can still reach us.
    console.log("[ContactForm] submission (not yet wired):", form)
    // ───────────────────────────────────────────────────────────────────────

    // Immediately open GitHub Issues as the actual delivery channel
    window.open(
      "https://github.com/Ebendttl/AskPay/issues/new?title=" +
        encodeURIComponent(form.subject) +
        "&body=" +
        encodeURIComponent(form.message),
      "_blank",
      "noopener,noreferrer"
    )

    setForm(EMPTY)
    setPending(false)
  }

  const isValid = form.subject.trim().length > 0 && form.message.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {/* ── Honest disclaimer ───────────────────────────────────────── */}
      <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-700">
        <span className="mt-px shrink-0">⚠️</span>
        <span>
          This form isn&apos;t connected to an email service yet. Clicking
          &quot;Send via GitHub&quot; will pre-fill a GitHub Issue with your
          message so it reaches us reliably.
        </span>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label
          htmlFor="contact-subject"
          className="block text-xs font-semibold text-foreground"
        >
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          maxLength={120}
          value={form.subject}
          onChange={handleChange}
          placeholder="e.g. Payment not going through"
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label
          htmlFor="contact-message"
          className="block text-xs font-semibold text-foreground"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={2000}
          value={form.message}
          onChange={handleChange}
          placeholder="Describe your issue or question in as much detail as possible…"
          className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-right text-[10px] text-muted-foreground tabular-nums">
          {form.message.length} / 2000
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-xl gap-2"
        disabled={!isValid || pending}
      >
        <Send className="h-4 w-4" />
        {pending ? "Opening GitHub…" : "Send via GitHub Issues"}
      </Button>
    </form>
  )
}
