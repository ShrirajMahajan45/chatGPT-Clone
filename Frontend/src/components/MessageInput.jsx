import { useState } from "react";
import { ArrowUp, Plus } from "lucide-react";

export default function MessageInput({
  onSend,
  isLoading,
}) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const message = text.trim();

    if (!message || isLoading) return;

    onSend(message);
    setText("");
  };

  return (
    <footer className="shrink-0 px-3 pb-3 pt-3 sm:px-6 sm:pb-5">
      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-[26px] border border-white/10 bg-[#303030] p-3 transition focus-within:border-white/20"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            placeholder="Message your AI..."
            aria-label="Write a message"
            className="max-h-40 min-h-12 w-full resize-y bg-transparent px-2 py-2 text-[15px] leading-6 text-white outline-none placeholder:text-gray-500"
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              aria-label="Additional options"
              title="Text input only"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300 hover:bg-white/10"
            >
              {/* <Plus size={20} /> */}
            </button>

            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-[#555] disabled:text-gray-400"
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </form>

        <p className="mt-3 text-center text-[11px] text-gray-500">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </footer>
  );
}