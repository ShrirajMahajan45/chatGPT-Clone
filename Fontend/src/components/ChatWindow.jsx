import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

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
      className="flex-1 overflow-y-auto"
      aria-label="Chat messages"
    >
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#303030] text-2xl">
              ✳
            </div>

            <h1 className="text-2xl font-semibold sm:text-3xl">
              What can I help with?
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              Ask a question or start a conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-7">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
              />
            ))}
          </div>
        )}

        {isLoading && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </section>
  );
}