import ChatProvider from "@/modules/chat/context/ChatContext";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ChatProvider>{children}</ChatProvider>;
}
