// ChatWidthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";

interface ChatWidthContextType {
  width: number;
  setWidth: Dispatch<SetStateAction<number>>;
}

const ChatWidthContext = createContext<ChatWidthContextType | null>(null);

export const useChatWidth = (): ChatWidthContextType => {
  const context = useContext(ChatWidthContext);
  if (!context) {
    throw new Error("useChatWidth must be used within a ChatWidthProvider");
  }
  return context;
};

export function ChatWidthProvider({ children }: { children: ReactNode }) {
  const [width, setWidth] = useState<number>(0);

  return (
    <ChatWidthContext.Provider value={{ width, setWidth }}>
      {children}
    </ChatWidthContext.Provider>
  );
}
