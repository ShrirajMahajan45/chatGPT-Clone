import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

export default function ChatHeader({
  title,
  onOpenSidebar,
  isAuthenticated,
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.05] px-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="rounded-lg p-2 text-gray-400 hover:bg-white/10 md:hidden"
        >
          <Menu size={20} />
        </button>

        <span className="truncate text-sm font-medium text-gray-200">
          {title || "New chat"}
        </span>
      </div>

      {!isAuthenticated && (
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/login"
            className="rounded-full px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
          >
            Log in
          </Link>

          <Link
            to="/register"
            className="rounded-full bg-white px-3.5 py-2 text-sm font-medium text-black hover:bg-gray-200"
          >
            Sign up
          </Link>
        </div>
      )}
    </header>
  );
}