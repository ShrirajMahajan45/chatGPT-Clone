import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { Sparkles, Plus } from "lucide-react";

import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import CreateChatModal from "../components/CreateChatModal";

import {
  addChat,
  renameChat,
  deleteChat,
  setActiveChat,
  addUserMessage,
  addAIMessage,
  setChatError,
  setChats,
  setChatMessages,
  setChatPending,
} from "../features/chats/chatSlice";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Manage the Socket.IO connection and mobile sidebar.
  const [socket, setSocket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [newChatError, setNewChatError] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // Get chat data and UI states from Redux.
  const {
    chats = [],
    activeChatId,
    pendingChats = {},
    error,
  } = useSelector((state) => state.chats);

  // Find the currently selected conversation.
  const activeChat = chats.find(
    (chat) => String(chat._id) === String(activeChatId),
  );

  // Check whether the selected conversation is waiting for an AI response.
  const isActiveChatLoading =
    Boolean(activeChatId) && Boolean(pendingChats[String(activeChatId)]);

  // Get messages from the selected conversation.
  const messages = activeChat?.messages || [];

  // Fetch messages for a selected chat.
  const getMessages = useCallback(
    async (chatId) => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/chat/messages/${chatId}`,
          { withCredentials: true },
        );

        dispatch(
          setChatMessages({
            chatId: String(chatId),
            messages: response.data.messages.map((message) => ({
              role: message.role === "user" ? "user" : "assistant",
              content: message.content,
            })),
          }),
        );
      } catch (error) {
        console.error("Failed to load messages:", error);
        dispatch(setChatError("Could not load messages. Please try again."));
      }
    },
    [dispatch],
  );

  // Create a new chat.
  // Open the create chat dialog.
  const handleNewChat = useCallback(() => {
    setNewChatTitle("");
    setNewChatError("");
    setIsCreateChatOpen(true);
  }, []);

  // Create a new chat using the entered title.
  const handleCreateChat = useCallback(
    async (event) => {
      event.preventDefault();

      const title = newChatTitle.trim();

      // Prevent creating a chat with an empty title.
      if (!title) {
        setNewChatError("Please enter a chat title.");
        return;
      }

      try {
        setIsCreatingChat(true);
        setNewChatError("");

        const response = await axios.post(
          "http://localhost:3000/api/chat/",
          { title },
          { withCredentials: true },
        );

        const newChat = {
          _id: response.data.chat._id,
          title: response.data.chat.title || "New Chat",
          messages: [],
        };

        dispatch(addChat(newChat));
        dispatch(setActiveChat(String(newChat._id)));
        dispatch(setChatError(null));

        // Close the dialog and reset its input.
        setIsCreateChatOpen(false);
        setNewChatTitle("");

        // Close the sidebar on mobile.
        setSidebarOpen(false);
      } catch (error) {
        console.error("Failed to create chat:", error);
        setNewChatError("Could not create chat. Please try again.");
      } finally {
        setIsCreatingChat(false);
      }
    },
    [dispatch, newChatTitle],
  );

  // Select an existing conversation.
  const handleSelectChat = useCallback(
    (chatId) => {
      dispatch(setActiveChat(String(chatId)));
      dispatch(setChatError(null));

      getMessages(chatId);

      // Close the sidebar after selecting a chat on mobile.
      setSidebarOpen(false);
    },
    [dispatch, getMessages],
  );

  // Send a message to the AI through Socket.IO.
  const handleSendMessage = useCallback(
    (value) => {
      const content = value.trim();

      // Prevent empty messages and multiple pending requests.
      if (!content || isActiveChatLoading) return;

      if (!socket || !socket.connected) {
        dispatch(setChatError("Connection lost. Please try again."));
        return;
      }

      // Immediately display the user's message.
      dispatch(
        addUserMessage({
          chatId: String(activeChatId),
          message: {
            role: "user",
            content,
          },
        }),
      );

      dispatch(setChatError(null));

      // Show the loading state for this conversation.
      dispatch(
        setChatPending({
          chatId: String(activeChatId),
          pending: true,
        }),
      );

      // Send the message to the backend.
      socket.emit("ai-message", {
        chat: activeChatId,
        content,
      });
    },
    [activeChatId, dispatch, isActiveChatLoading, socket],
  );

  // Rename an existing chat.
  const handleRenameChat = useCallback(
    async (chatId, title) => {
      const response = await axios.patch(
        `http://localhost:3000/api/chat/${chatId}`,
        { title },
        { withCredentials: true },
      );

      dispatch(
        renameChat({
          chatId,
          title: response.data.chat.title,
        }),
      );

      dispatch(setChatError(null));
    },
    [dispatch],
  );

  // Delete an existing chat.
  const handleDeleteChat = useCallback(
    async (chatId) => {
      await axios.delete(`http://localhost:3000/api/chat/${chatId}`, {
        withCredentials: true,
      });

      dispatch(deleteChat(chatId));
      dispatch(setChatError(null));
      setSidebarOpen(false);
    },
    [dispatch],
  );

  // Log out the user and clear the current chat data.
  const handleLogout = useCallback(async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        { withCredentials: true },
      );

      socket?.disconnect();
      setSocket(null);

      dispatch(setChats([]));
      dispatch(setActiveChat(null));
      dispatch(setChatError(null));

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(setChatError("Could not log out. Please try again."));
    }
  }, [dispatch, navigate, socket]);

  // Load existing chats and establish the Socket.IO connection.
  useEffect(() => {
    let isMounted = true;

    const loadChats = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/chat/", {
          withCredentials: true,
        });

        if (isMounted) {
          dispatch(setChats(response.data.chats));
          dispatch(setChatError(null));
        }
      } catch (error) {
        if (!isMounted) return;

        console.error("Failed to load chats:", error);

        if (error.response?.status === 401) {
          dispatch(
            setChatError("Your login has expired. Please log in again."),
          );
        } else {
          dispatch(setChatError("Could not load chats. Please try again."));
        }
      }
    };

    loadChats();

    const newSocket = io("http://localhost:3000", {
      withCredentials: true,
    });

    // Handle successful AI responses.
    const handleAIResponse = (messagePayload) => {
      if (!isMounted) return;

      dispatch(
        addAIMessage({
          chatId: String(messagePayload.chat),
          message: {
            role: "assistant",
            content: messagePayload.content,
          },
        }),
      );

      // Stop the loading indicator for the completed conversation.
      dispatch(
        setChatPending({
          chatId: String(messagePayload.chat),
          pending: false,
        }),
      );
    };

    // Handle Socket.IO connection errors.
    const handleConnectionError = (error) => {
      if (!isMounted) return;

      console.error("Socket connection failed:", error.message);
      dispatch(setChatError("Unable to connect to the chat service."));
    };

    // Handle errors returned by the AI service.
    const handleAIError = (errorPayload) => {
      if (!isMounted) return;

      dispatch(
        setChatPending({
          chatId: String(errorPayload.chat),
          pending: false,
        }),
      );

      dispatch(
        setChatError(
          errorPayload.message || "Unable to generate an AI response.",
        ),
      );
    };

    // Register Socket.IO event listeners.
    newSocket.on("ai-response", handleAIResponse);
    newSocket.on("connect_error", handleConnectionError);
    newSocket.on("ai-error", handleAIError);

    setSocket(newSocket);

    // Remove listeners and disconnect when the component unmounts.
    return () => {
      isMounted = false;

      newSocket.off("ai-response", handleAIResponse);
      newSocket.off("connect_error", handleConnectionError);
      newSocket.off("ai-error", handleAIError);

      newSocket.disconnect();
    };
  }, [dispatch]);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#212121] text-white">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isAuthenticated={true}
        onLogout={handleLogout}
      />

      {/* Main conversation area */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top navigation header */}
        <ChatHeader
          title={activeChat?.title || "Your AI"}
          isAuthenticated={true}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Display application errors when they occur */}
        {error && (
          <div className="mx-4 mt-3 flex items-center justify-between rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => dispatch(setChatError(null))}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Display the selected conversation or welcome screen */}
        {activeChat ? (
          <ChatWindow messages={messages} isLoading={isActiveChatLoading} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
            {/* Welcome icon */}
            <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#303030] text-gray-100 shadow-lg">
              <Sparkles size={28} />
            </div>

            {/* Welcome heading */}
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              What can I help with?
            </h1>

            {/* Welcome description */}
            <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
              Ask a question, explore an idea, or get help with your code.
            </p>

            {/* Create a new conversation */}
            <button
              type="button"
              onClick={handleNewChat}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-gray-200 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
            >
              <Plus size={17} />
              New chat
            </button>
          </div>
        )}

        {/* Display the message input only when a conversation is selected */}
        {activeChat && (
          <MessageInput
            onSend={handleSendMessage}
            isLoading={isActiveChatLoading}
          />
        )}
      </main>
      <CreateChatModal
        isOpen={isCreateChatOpen}
        title={newChatTitle}
        setTitle={(value) => {
          setNewChatTitle(value);
          setNewChatError("");
        }}
        error={newChatError}
        isCreating={isCreatingChat}
        onClose={() => setIsCreateChatOpen(false)}
        onSubmit={handleCreateChat}
      />
    </div>
  );
};

export default Home;
