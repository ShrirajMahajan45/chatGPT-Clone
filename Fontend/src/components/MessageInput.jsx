
import { useState } from "react";
import { ArrowUp, Plus } from "lucide-react";

export default function MessageInput({ onSend, isLoading }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const message = input.trim();

    if (!message || isLoading) return;

    onSend(message);
    setInput("");
  };

  return (
    <footer className="shrink-0 px-3 pb-3 pt-3 sm:px-6 sm:pb-5">
      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-[26px] border border-white/[0.09] bg-[#303030] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition focus-within:border-white/[0.18]"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Message Your AI..."
            aria-label="Write a message"
            rows={1}
            className="max-h-40 min-h-12 w-full resize-y bg-transparent px-2 py-2 text-[15px] leading-6 text-gray-100 outline-none placeholder:text-gray-500"
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              aria-label="Attachments"
              title="Attachments coming soon"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300 transition hover:bg-white/[0.08]"
            >
              <Plus size={21} />
            </button>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-[#555] disabled:text-gray-400"
            >
              <ArrowUp size={20} strokeWidth={2.5} />
            </button>
          </div>
        </form>

        <p className="mt-3 text-center text-[11px] leading-4 text-gray-500">
          Your AI may make mistakes. Verify important information.
        </p>
      </div>
    </footer>
  );
}
