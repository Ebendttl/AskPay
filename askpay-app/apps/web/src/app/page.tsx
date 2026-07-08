/**
 * Home page — Phase 3
 *
 * Renders the AskPay chat interface. The ChatBox component handles:
 *  - MiniPay detection (auto-connect / skip connect button)
 *  - Fee reading from PayPerQuery.fee()
 *  - approve → askQuestion payment flow
 *  - Step-by-step status display
 */

import { ChatBox } from "@/components/chat-box";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 px-4 py-6">
      <ChatBox />
    </main>
  );
}
