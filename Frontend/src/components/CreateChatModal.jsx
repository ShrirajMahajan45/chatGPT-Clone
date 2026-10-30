import { useEffect, useRef } from "react";

const CreateChatModal = ({
  isOpen,
  title,
  setTitle,
  error,
  isCreating,
  onClose,
  onSubmit,
}) => {
  const inputRef = useRef(null);

  // Focus the input when the dialog opens.
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={() => {
        if (!isCreating) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-chat-title"
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#2b2b2b] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="create-chat-title" className="text-lg font-semibold text-white">
          Create a new chat
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Give your conversation a name to get started.
        </p>

        <form onSubmit={onSubmit}>
          <input
            ref={inputRef}
            type="text"
            required
            maxLength={60}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter chat title..."
            className="mt-5 w-full rounded-xl border border-white/10 bg-[#353535] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white/30"
          />

          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              disabled={isCreating}
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isCreating}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Chat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChatModal;
