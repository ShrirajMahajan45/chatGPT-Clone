
import { Link } from "react-router-dom";
import {
  PanelLeftClose,
  MessageSquarePlus,
  Search,
  MessageSquare,
  LogIn,
  UserRoundPlus,
  Sparkles,
} from "lucide-react";

export default function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  isOpen,
  onClose,
  isAuthenticated = false,
}) {
  return (
    <>
      {isOpen && (
        <button
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px]
          flex-col border-r border-white/[0.07] bg-[#171717]
          p-3 transition-transform duration-200
          md:static md:translate-x-0
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
      >
        {/* Brand */}
        <div className="mb-6 flex h-10 items-center justify-between px-2">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black">
              <Sparkles size={17} />
            </div>
            <span className="text-base font-semibold tracking-tight text-white">
              Your AI
            </span>
          </Link>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Main actions */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-3 rounded-xl border border-white/[0.08] px-3 py-3 text-sm text-gray-100 transition hover:border-white/15 hover:bg-white/[0.06]"
        >
          <MessageSquarePlus size={18} />
          New chat
        </button>

        <button
          type="button"
          onClick={() => {
            // Add chat-search functionality here.
          }}
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
        >
          <Search size={18} />
          Search chats
        </button>

        {/* Conversation history */}
        <div className="mb-2 mt-8 px-3 text-xs font-medium text-gray-500">
          Recent
        </div>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              title={chat.title}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                activeChatId === chat.id
                  ? "bg-white/[0.09] text-white"
                  : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-200"
              }`}
            >
              <MessageSquare
                size={16}
                className="shrink-0"
              />
              <span className="truncate">{chat.title}</span>
            </button>
          ))}

          {chats.length === 0 && (
            <p className="px-3 py-2 text-xs leading-5 text-gray-600">
              Your conversations will appear here.
            </p>
          )}
        </div>

        {/* Authentication actions */}
        <div className="mt-3 border-t border-white/[0.08] pt-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 rounded-xl p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#303030] text-sm font-semibold">
                U
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  Your account
                </p>
                <p className="text-xs text-gray-500">
                  Signed in
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <LogIn size={18} />
                Log in
              </Link>

              <Link
                to="/register"
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
              >
                <UserRoundPlus size={17} />
                Sign up for free
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
