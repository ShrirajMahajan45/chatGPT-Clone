import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [],
  activeChatId: null,
  pendingChats: {},
  loadingChats: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    },

    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
    },

    addChat: (state, action) => {
      state.chats.unshift(action.payload);
    },

    renameChat: (state, action) => {
      const { chatId, title } = action.payload;

      const chat = state.chats.find(
        (item) => String(item._id) === String(chatId),
      );

      if (chat) {
        chat.title = title;
      }
    },

    deleteChat: (state, action) => {
      const chatId = String(action.payload);

      state.chats = state.chats.filter((chat) => String(chat._id) !== chatId);

      delete state.pendingChats[chatId];

      if (String(state.activeChatId) === chatId) {
        state.activeChatId = null;
      }
    },

    setChatMessages: (state, action) => {
      const { chatId, messages } = action.payload;

      const chat = state.chats.find(
        (item) => String(item._id) === String(chatId),
      );

      if (chat) {
        chat.messages = messages;
      }
    },

    addUserMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find(
        (item) => String(item._id) === String(chatId),
      );

      if (chat) {
        if (!chat.messages) chat.messages = [];
        chat.messages.push(message);
      }
    },

    addAIMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find(
        (item) => String(item._id) === String(chatId),
      );

      if (chat) {
        if (!chat.messages) chat.messages = [];
        chat.messages.push(message);
      }
    },

    setChatPending: (state, action) => {
      const { chatId, pending } = action.payload;
      const id = String(chatId);

      if (pending) {
        state.pendingChats[id] = true;
      } else {
        delete state.pendingChats[id];
      }
    },

    setLoadingChats: (state, action) => {
      state.loadingChats = action.payload;
    },

    setChatError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setChats,
  setChatMessages,
  setActiveChat,
  addChat,
  renameChat,
  deleteChat,
  addUserMessage,
  addAIMessage,
  setChatPending,
  setLoadingChats,
  setChatError,
} = chatSlice.actions;

export default chatSlice.reducer;
