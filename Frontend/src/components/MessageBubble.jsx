
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User, Copy, Check } from "lucide-react";

export default function MessageBubble({ message }) {
  // Check whether the message was sent by the user.
  const isUser = message.role === "user";

  // Track whether the message has been copied.
  const [copied, setCopied] = useState(false);

  // Copy the message content to the clipboard.
  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);

      // Reset the copy button after a short time.
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Unable to copy message:", error);
    }
  };

  return (
    <div
      className={`flex gap-3 sm:gap-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* AI assistant icon */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#303030] text-gray-200">
          <Bot size={18} />
        </div>
      )}

      {/* Message content */}
      <div
        className={`min-w-0 ${
          isUser
            ? "max-w-[88%] rounded-3xl border border-white/[0.05] bg-[#303030] px-4 py-3 sm:max-w-[80%]"
            : "flex-1 py-1"
        }`}
      >
        {/* Render user messages as plain text and AI messages as Markdown */}
        {isUser ? (
          <div className="whitespace-pre-wrap break-words text-[15px] leading-7 text-gray-100">
            {message.content}
          </div>
        ) : (
          <div className="break-words text-[15px] leading-7 text-gray-200 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-white [&_em]:italic [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:text-gray-400 [&_a]:text-blue-400 [&_a]:underline [&_a]:underline-offset-2 [&_pre]:my-3 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-[#171717] [&_pre]:p-4 [&_code]:rounded [&_code]:bg-[#171717] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_hr]:my-4 [&_hr]:border-white/10 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-white/10 [&_th]:bg-[#303030] [&_th]:p-2 [&_td]:border [&_td]:border-white/10 [&_td]:p-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ ...props }) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Show copy button only for AI responses */}
        {!isUser && (
          <button
            type="button"
            onClick={copyMessage}
            aria-label={copied ? "Message copied" : "Copy response"}
            title={copied ? "Copied!" : "Copy response"}
            className="mt-2 inline-flex items-center gap-2 rounded-lg p-2 text-gray-500 transition hover:bg-white/10 hover:text-gray-200"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}

            {copied && <span className="text-xs">Copied</span>}
          </button>
        )}
      </div>

      {/* User icon */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#454545] text-gray-200">
          <User size={17} />
        </div>
      )}
    </div>
  );
}
