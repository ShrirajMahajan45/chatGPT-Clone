import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({
  messages,
  isLoading,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  return (
    <section
      className="min-h-0 flex-1 overflow-y-auto"
      aria-label="Conversation"
    >
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-10">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#292929]">
              <Sparkles size={24} />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-gray-100 sm:text-3xl">
              What can I help with?
            </h1>

            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-400">
              Ask a question, explore an idea, or start a new conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {messages.map((message, index) => (
              <MessageBubble
                key={message._id || message.id || `${message.role}-${index}`}
                message={message}
              />
            ))}
          </div>
        )}

        {isLoading && (
          <div className="mt-8 flex items-center gap-3 text-sm text-gray-400">
            <Sparkles size={20} className="animate-pulse" />
            AI is thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </section>
  );
}