import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  MessageSquare,
  PanelLeftClose,
  LogIn,
  UserPlus,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Check,
  LogOut,
} from "lucide-react";

export default function Sidebar({
  chats = [],
  activeChatId,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  open = false,
  onClose,
  isAuthenticated,
  onLogout,
}) {
  const [menuChatId, setMenuChatId] = useState(null);
  const [renamingChat, setRenamingChat] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [deletingChat, setDeletingChat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };
  const handleRenameStart = (chat) => {
    setRenamingChat(chat);
    setRenameTitle(chat.title || "");
    setMenuChatId(null);
  };

  const handleRenameSubmit = async (event) => {
    event.preventDefault();

    const title = renameTitle.trim();

    if (!title || saving || !renamingChat) return;

    setSaving(true);

    try {
      await onRenameChat(renamingChat._id, title);
      setRenamingChat(null);
    } catch (error) {
      console.error("Rename failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingChat || saving) return;

    setSaving(true);

    try {
      await onDeleteChat(deletingChat._id);
      setDeletingChat(null);
      setMenuChatId(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setSaving(false);
    }
  };

  // Close the three-dot menu when clicking outside
  useEffect(() => {
    if (menuChatId === null) return;

    const handleClickOutside = (event) => {
      if (!event.target.closest("[data-chat-menu]")) {
        setMenuChatId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuChatId]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Chat history sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px]
          flex-col bg-[#171717] p-3 transition-transform duration-200
          md:static md:translate-x-0 md:shrink-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar header and application branding */}
        <div className="mb-7 flex items-center justify-between px-2">
          <span className="text-lg font-semibold tracking-tight text-white">
            Your AI
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 md:hidden"
          >
            <PanelLeftClose size={19} />
          </button>
        </div>

        {/* New chat */}
        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm text-gray-200 transition duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <Plus size={18} />
          New chat
        </button>

        {/* Heading for the conversation history */}
        <p className="mb-3 mt-8 px-3 text-xs font-medium uppercase tracking-wider text-gray-500">
          Recent chats
        </p>

        {/* Scrollable list of previous conversations */}
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto hide-scrollbar pr-1">
          {chats.map((chat) => {
            const isActive = String(activeChatId) === String(chat._id);

            const isMenuOpen = String(menuChatId) === String(chat._id);

            return (
              <div
                key={chat._id}
                data-chat-menu
                className={`group relative flex items-center rounded-xl transition-colors duration-150 ${
                  isActive
                    ? "bg-white/[0.10] text-white"
                    : "text-gray-400 hover:bg-white/[0.06] hover:text-gray-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectChat(chat._id);
                    setMenuChatId(null);
                    onClose?.();
                  }}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm"
                >
                  <MessageSquare size={16} className="shrink-0" />

                  <span className="truncate">{chat.title || "New chat"}</span>
                </button>

                {/* Three-dot menu */}

                <button
                  type="button"
                  aria-label={`Options for ${chat.title || "chat"}`}
                  aria-expanded={isMenuOpen}
                  title="Chat options"
                  onClick={(event) => {
                    event.stopPropagation();

                    setMenuChatId((current) =>
                      String(current) === String(chat._id) ? null : chat._id,
                    );
                  }}
                  className={`mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md
                        text-gray-300 hover:bg-white/10
                        ${
                          isMenuOpen
                            ? "opacity-100"
                            : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        }`}
                >
                  <MoreHorizontal size={20} />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-1 top-10 z-30 w-40 rounded-xl border border-white/10 bg-[#252525] p-1.5 shadow-xl">
                    <button
                      type="button"
                      onClick={() => handleRenameStart(chat)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/10"
                    >
                      <Pencil size={15} />
                      Rename
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeletingChat(chat);
                        setMenuChatId(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {chats.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-600">
              No conversations yet
            </p>
          )}
        </div>

        {/* Sidebar footer containing authentication actions */}
        <div className="space-y-1 border-t border-white/[0.08] pt-3">
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
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-300 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              >
                <LogOut size={18} />
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Rename dialog */}
      {renamingChat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleRenameSubmit}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#252525] p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Rename chat</h2>

              <button
                type="button"
                aria-label="Close rename dialog"
                onClick={() => setRenamingChat(null)}
                disabled={saving}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <input
              autoFocus
              maxLength={100}
              value={renameTitle}
              onChange={(event) => setRenameTitle(event.target.value)}
              placeholder="Enter chat title"
              className="w-full rounded-xl border border-white/10 bg-[#171717] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenamingChat(null)}
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!renameTitle.trim() || saving}
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={16} />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deletingChat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-chat-title"
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#252525] p-5 shadow-2xl"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <Trash2 size={21} />
            </div>

            <h2
              id="delete-chat-title"
              className="text-lg font-semibold text-white"
            >
              Delete this chat?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              "{deletingChat.title || "New chat"}" and its messages will be
              permanently deleted. This action cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingChat(null)}
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={saving}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Delete chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
