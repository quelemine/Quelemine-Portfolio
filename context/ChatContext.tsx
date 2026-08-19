"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

interface ChatContextValue {
  pendingMessage: string;
  openWithMessage: (msg: string) => void;
  clearPending: () => void;
}

const ChatContext = createContext<ChatContextValue>({
  pendingMessage: "",
  openWithMessage: () => {},
  clearPending: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [pendingMessage, setPendingMessage] = useState("");
  return (
    <ChatContext.Provider value={{
      pendingMessage,
      openWithMessage: (msg) => setPendingMessage(msg),
      clearPending: () => setPendingMessage(""),
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChatContext = () => useContext(ChatContext);
