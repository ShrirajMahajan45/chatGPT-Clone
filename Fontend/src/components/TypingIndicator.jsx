export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-400">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white">
        ✳
      </div>

      <div className="flex items-center gap-1">
        <span className="animate-bounce">●</span>
        <span className="animate-bounce [animation-delay:150ms]">
          ●
        </span>
        <span className="animate-bounce [animation-delay:300ms]">
          ●
        </span>
        <span className="ml-2">Thinking...</span>
      </div>
    </div>
  );
}