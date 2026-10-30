import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  // Automatically scroll to the latest message when the conversation updates.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  return (
    <section
      className="hide-scrollbar min-h-0 flex-1 overflow-y-auto"
      aria-label="Conversation"
    >
      {/* Keep conversation content centered and responsive */}
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-10">
        {/* Show the welcome screen when the selected chat has no messages */}
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            {/* Welcome icon */}
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#303030] text-gray-100">
              <Sparkles size={25} />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-gray-100 sm:text-3xl">
              What can I help with?
            </h1>

            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-400">
              Ask a question, explore an idea, or start a new conversation.
            </p>
          </div>
        ) : (
          /* Display all messages in the selected conversation */
          <div className="space-y-8">
            {messages.map((message, index) => (
              <MessageBubble
                key={message._id || message.id || `${message.role}-${index}`}
                message={message}
              />
            ))}
          </div>
        )}

        {/* Display the loading indicator while waiting for the AI response */}
        {isLoading && (
          <div
            className="mt-8 flex items-center gap-3 text-sm text-gray-400"
            role="status"
            aria-live="polite"
          >
            <Sparkles size={19} className="animate-pulse text-gray-300" />
            <span>AI is thinking...</span>
          </div>
        )}

        {/* Reference element used for automatic scrolling */}
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
