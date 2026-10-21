export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700">
          ✳
        </div>
      )}

      <div
        className={`max-w-[85%] whitespace-pre-wrap break-words text-sm leading-7 sm:max-w-[80%] ${
          isUser
            ? "rounded-3xl bg-[#303030] px-4 py-3"
            : "min-w-0 flex-1 py-0.5"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}