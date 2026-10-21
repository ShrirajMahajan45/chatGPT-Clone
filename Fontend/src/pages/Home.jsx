
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";

const API_URL = "http://localhost:5000/api/chat";

const createChat = () => ({
  id: crypto.randomUUID(),
  title: "New chat",
  messages: [],
});

export default function Home() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Replace with your real authentication state later.
  const isAuthenticated = false;

  const activeChat = chats.find(
    (chat) => chat.id === activeChatId
  );

  const handleNewChat = () => {
    const chat = createChat();

    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
    setError("");
    setSidebarOpen(false);
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setError("");
    setSidebarOpen(false);
  };

  const handleSend = async (text) => {
    let chatId = activeChatId;
    let previousMessages = activeChat?.messages ?? [];

    if (!chatId) {
      const chat = createChat();
      chatId = chat.id;
      previousMessages = [];

      setChats((prev) => [chat, ...prev]);
      setActiveChatId(chatId);
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const history = [...previousMessages, userMessage];

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title:
                chat.title === "New chat"
                  ? text.slice(0, 35)
                  : chat.title,
              messages: history,
            }
          : chat
      )
    );

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          message: text,
          history: history.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get response");
      }

      const reply = data.reply ?? data.response ?? data.message;

      if (typeof reply !== "string") {
        throw new Error("Unexpected response from the server");
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: reply,
                  },
                ],
              }
            : chat
        )
      );
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-[#212121] text-gray-100">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isAuthenticated={isAuthenticated}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          title={activeChat?.title || "New chat"}
          onOpenSidebar={() => setSidebarOpen(true)}
          isAuthenticated={isAuthenticated}
        />

        <ChatWindow
          messages={activeChat?.messages ?? []}
          isLoading={isLoading}
        />

        {error && (
          <div
            role="alert"
            className="mx-auto mb-2 max-w-3xl px-4 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        <MessageInput
          onSend={handleSend}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
