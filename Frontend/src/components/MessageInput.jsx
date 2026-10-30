import { useState } from "react";
import { ArrowUp } from "lucide-react";

export default function MessageInput({ onSend, isLoading }) {
  // Store the message currently being typed by the user.
  const [text, setText] = useState("");

  // Handle message submission.
  const handleSubmit = (e) => {
    e.preventDefault();

    const message = text.trim();

    // Don't send empty messages or send another message while AI is responding.
    if (!message || isLoading) return;

    onSend(message);

    // Clear the input after sending the message.
    setText("");
  };

  return (
    <footer className="shrink-0 px-3 pb-3 pt-3 sm:px-6 sm:pb-5">
      {/* Keep the message input centered with the conversation */}
      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-[26px] border border-white/10 bg-[#303030] p-3 transition-colors duration-200 focus-within:border-white/25"
        >
          {/* Message text area */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends the message; Shift + Enter creates a new line.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            disabled={isLoading}
            rows={1}
            placeholder="Message Your AI..."
            aria-label="Write a message"
            className="hide-scrollbar max-h-40 min-h-12 w-full resize-none overflow-y-auto bg-transparent px-2 py-2 text-[15px] leading-6 text-white outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
          />

          {/* Input actions */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              aria-label="Send message"
              title={isLoading ? "AI is responding..." : "Send message"}
              disabled={isLoading || !text.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-all hover:bg-gray-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:bg-[#505050] disabled:text-gray-400"
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </form>

        {/* Helpful AI response disclaimer */}
        <p className="mt-3 text-center text-[11px] text-gray-500">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </footer>
  );
}
