import { Bot, User, Copy } from "lucide-react";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message.content);
  };

  return (
    <div
      className={`flex gap-3 sm:gap-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#303030] text-gray-200">
          <Bot size={18} />
        </div>
      )}

      <div
        className={`min-w-0 max-w-[88%] sm:max-w-[80%] ${
          isUser
            ? "rounded-3xl bg-[#303030] px-4 py-3"
            : "flex-1 py-1"
        }`}
      >
        <div className="whitespace-pre-wrap break-words text-[15px] leading-7 text-gray-100">
          {message.content}
        </div>

        {!isUser && (
          <button
            onClick={copyMessage}
            aria-label="Copy response"
            className="mt-2 rounded-lg p-2 text-gray-500 transition hover:bg-white/10 hover:text-gray-200"
          >
            <Copy size={15} />
          </button>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#454545] text-gray-200">
          <User size={17} />
        </div>
      )}
    </div>
  );
}