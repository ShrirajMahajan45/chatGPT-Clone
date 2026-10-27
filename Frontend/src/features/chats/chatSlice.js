
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [],
  activeChatId: null,
  sendingMessage: false,
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

    addUserMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find(
        (item) => String(item._id) === String(chatId)
      );

      if (chat) {
        if (!chat.messages) chat.messages = [];
        chat.messages.push(message);
      }
    },

    addAIMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find(
        (item) => String(item._id) === String(chatId)
      );

      if (chat) {
        if (!chat.messages) chat.messages = [];
        chat.messages.push(message);
      }

      state.sendingMessage = false;
    },

    setSendingMessage: (state, action) => {
      state.sendingMessage = action.payload;
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
  setActiveChat,
  addChat,
  addUserMessage,
  addAIMessage,
  setSendingMessage,
  setLoadingChats,
  setChatError,
} = chatSlice.actions;

export default chatSlice.reducer;
