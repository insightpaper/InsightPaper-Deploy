import ChatProvider from "@/modules/chat/context/ChatContext";
import { ChatWidthProvider } from "@/modules/chat/context/ChatWidthContext";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ChatWidthProvider>
      <ChatProvider>{children}</ChatProvider>
    </ChatWidthProvider>
  );
}
