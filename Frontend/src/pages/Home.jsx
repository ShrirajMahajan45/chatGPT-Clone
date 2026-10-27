import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { io } from "socket.io-client";

import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";

import {
  addChat,
  setActiveChat,
  addUserMessage,
  addAIMessage,
  setSendingMessage,
  setChatError,
  setChats,
} from "../features/chats/chatSlice";


const Home = () => {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);

  // Read chats and UI state from Redux
  const {
    chats = [],
    activeChatId,
    sendingMessage,
    error,
  } = useSelector((state) => state.chats);

  // Keep track of pending demo responses
  const responseTimers = useRef([]);

  // Find the selected conversation
  const activeChat = chats.find(
    (chat) => String(chat._id) === String(activeChatId),
  );

  // const messages = activeChat?.messages || [];
  const [messages, setMessages] = useState([]);

  // Create a new chat
  const handleNewChat = useCallback(async () => {
    let title = window.prompt("Enter the title for the new chat:", "");
    if (title) {
      title = title.trim();
    }
    if (!title) return;

    // Intigrating the createChat Backend Functionality
    const response = await axios.post(
      "http://localhost:3000/api/chat/",
      {
        title,
      },
      {
        //to send the cookies with api we have to use it, nahitr unauthorized error yeto
        withCredentials: true,
      },
    );
    getMessages(response.data.chat._id);

    const newChat = {
      _id: response.data.chat._id,
      title: response.data.chat.title || "New Chat",
      messages: [],
    };

    dispatch(addChat(newChat));
    dispatch(setActiveChat(newChat._id));
    dispatch(setChatError(null));
  }, [dispatch]);

  // Select a conversation from the sidebar
  const handleSelectChat = useCallback(
    (chatId) => {
      getMessages(chatId);
      dispatch(setActiveChat(String(chatId)));
      dispatch(setChatError(null));
    },
    [dispatch],
  );

  // Send a message and simulate an AI response
  const handleSendMessage = useCallback(
    (value) => {
      const content = value.trim();

      if (!content || sendingMessage) return;

      // set the userMessage in useState
      const newUserMessage = { role: "user", content: content };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);

      socket.emit("ai-message", {
        chat: activeChatId,
        content: content,
      });

      // // Automatically create a chat if none is selected
      // let chatId = activeChatId;

      // if (!chatId) {
      //   chatId = `chat-${Date.now()}`;

      //   dispatch(
      //     addChat({
      //       _id: chatId,
      //       title: "New chat",
      //       messages: [],
      //       // createdAt: new Date().toISOString(),
      //     }),
      //   );

      //   dispatch(setActiveChat(chatId));
      // }

      // // Display the user's message immediately
      // dispatch(
      //   addUserMessage({
      //     chatId: String(chatId),
      //     message: {
      //       role: "user",
      //       content,
      //       id: `user-${Date.now()}`,
      //     },
      //   }),
      // );

      // dispatch(setChatError(null));
      // dispatch(setSendingMessage(true));

      // // Simulate a short AI thinking delay
      // const timer = setTimeout(() => {
      //   const reply = getMockAIResponse(content);

      //   // Add the simulated AI response to the active conversation
      // dispatch(
      //   addAIMessage({
      //     chatId: String(chatId),
      //     message: {
      //       role: "assistant",
      //       content: reply,
      //       id: `assistant-${Date.now()}`,
      //     },
      //   }),
      // );
      // }, 900);

      // responseTimers.current.push(timer);
    },
    [activeChatId, dispatch, sendingMessage],
  );

  // fetching all messages in chat from DB:
  const getMessages = async (chatId) => {
    // fetching all messages in chat from DB
    const response = await axios.get(
      `http://localhost:3000/api/chat/messages/${chatId}`,
      { withCredentials: true },
    );

    setMessages(
      response.data.messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    );
  };

  useEffect(() => {
    // to retrived all chats in DB
    axios
      .get("http://localhost:3000/api/chat/", { withCredentials: true })
      .then((response) => {
        dispatch(setChats(response.data.chats.reverse()));
      })
      .catch((error) => {
        console.error("Failed to load chats:", error);
        dispatch(setChatError("Could not load chats. Please log in again."));
      });

    // set socketIO
    const newSocket = io("http://localhost:3000", {
      withCredentials: true,
    });

    newSocket.on("ai-response", (messagePayload) => {

      // set the aiResponse in Redux state
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: messagePayload.content },
      ]);

      dispatch(setSendingMessage(false));
      // dispatch(
      //   addAIMessage({
      //     chatId: String(chatId),
      //     message: {
      //       role: "assistant",
      //       content: reply,
      //       id: `assistant-${Date.now()}`,
      //     },
      //   }),
      // );
    });

    setSocket(newSocket);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#212121] text-white">
      {/* Sidebar: create chats and switch conversations */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        isAuthenticated={true}
      />

      {/* Main conversation area */}
      <main className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          title={activeChat?.title || "ChatGPT"}
          isAuthenticated={true}
        />

        {/* Display errors without hiding the chat */}
        {error && (
          <div className="mx-4 mt-3 flex items-center justify-between rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>

            <button
              onClick={() => dispatch(setChatError(null))}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Show the conversation or welcome screen */}
        {activeChat ? (
          <ChatWindow messages={messages} isLoading={sendingMessage} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">
              ✦
            </div>

            <h1 className="mb-3 text-2xl font-semibold sm:text-3xl">
              What can I help with?
            </h1>

            <p className="mb-7 max-w-md text-sm text-gray-400">
              Ask a question, explore an idea, or get help with your code.
            </p>

            <button
              onClick={handleNewChat}
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm transition hover:bg-white/10"
            >
              + New chat
            </button>
          </div>
        )}

        {/* Message composer */}
        {activeChat && (
          <MessageInput onSend={handleSendMessage} disabled={sendingMessage} />
        )}

        <p className="px-3 pb-3 text-center text-xs text-gray-500">
          Demo mode · AI responses are simulated
        </p>
      </main>
    </div>
  );
};

export default Home;
