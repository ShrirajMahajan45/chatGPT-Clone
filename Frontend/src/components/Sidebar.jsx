
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  MessageSquare,
  PanelLeftClose,
  LogIn,
  UserPlus,
} from "lucide-react";

export default function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  open,
  onClose,
  isAuthenticated,
}) {
  return (
    <>
      {open && (
        <button
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px]
          flex-col bg-[#171717] p-3 transition-transform
          duration-200 md:static md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <span className="text-lg font-semibold tracking-tight">
            Your AI
          </span>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 md:hidden"
          >
            <PanelLeftClose size={19} />
          </button>
        </div>

        <button
          onClick={onNewChat}
          className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm hover:bg-white/5"
        >
          <Plus size={18} />
          New chat
        </button>

        {/* <Link
          to="/login"
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
        >
          <Search size={18} />
          Search chats
        </Link> */}

        <p className="mb-2 mt-8 px-3 text-xs font-medium text-gray-500">
          Recent chats
        </p>

        <div className="flex-1 space-y-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => onSelectChat(chat._id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                activeChatId === chat._id
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <MessageSquare size={16} className="shrink-0" />
              <span className="truncate">
                {chat.title || "New chat"}
              </span>
            </button>
          ))}

          {chats.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-600">
              No conversations yet
            </p>
          )}
        </div>

        <div className="space-y-1 border-t border-white/10 pt-3">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-300 hover:bg-white/5"
              >
                <LogIn size={18} />
                Log in
              </Link>

              <Link
                to="/register"
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-3 text-sm font-medium text-black hover:bg-gray-200"
              >
                <UserPlus size={17} />
                Sign up
              </Link>
            </>
          ) : (
            <div className="rounded-lg px-3 py-3 text-sm text-gray-300">
              Signed in
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
