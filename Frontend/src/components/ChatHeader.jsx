
import { PanelLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ChatHeader({
  title,
  isAuthenticated,
  onOpenSidebar,
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#212121] px-3 sm:px-5">

      {/* Left section: sidebar button and conversation title */}
      <div className="flex min-w-0 items-center gap-2">

        {/* Show sidebar toggle only on mobile screens */}
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open chat history"
          className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white md:hidden"
        >
          <PanelLeft size={20} />
        </button>

        {/* Show current chat title or application name */}
        <span className="truncate text-sm font-medium text-gray-200">
          {title || "Your AI"}
        </span>
      </div>

      {/* Right section: authentication links for guests */}
      {!isAuthenticated && (
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/login"
            className="rounded-full px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            Log in
          </Link>

          <Link
            to="/register"
            className="rounded-full bg-white px-3.5 py-2 text-sm font-medium text-black transition hover:bg-gray-200"
          >
            Sign up
          </Link>
        </div>
      )}
    </header>
  );
}
