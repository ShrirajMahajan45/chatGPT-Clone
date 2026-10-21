
import { Link } from "react-router-dom";
import { Menu, ChevronDown } from "lucide-react";

export default function ChatHeader({
  title,
  onOpenSidebar,
  isAuthenticated = false,
}) {
  return (
    <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.05] bg-[#212121] px-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/[0.07] hover:text-white md:hidden"
        >
          <Menu size={20} />
        </button>

        <button className="flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-gray-200 hover:bg-white/[0.05]">
          <span className="truncate">{title || "New chat"}</span>
          <ChevronDown size={15} className="shrink-0 text-gray-500" />
        </button>
      </div>

      {!isAuthenticated && (
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/login"
            className="rounded-full px-3 py-2 text-sm text-gray-300 transition hover:bg-white/[0.07] hover:text-white"
          >
            Log in
          </Link>

          <Link
            to="/register"
            className="rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
          >
            Sign up
          </Link>
        </div>
      )}
    </header>
  );
}
