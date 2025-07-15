"use client";
import { CircularProgress, IconButton, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useChat } from "@/modules/chat/context/ChatContext";
import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Download } from "@mui/icons-material";
import { useChatWidth } from "@/modules/chat/context/ChatWidthContext";

interface ResizableChatProps {
  onClose: () => void;
  customPrompt?: string;
}

export default function ResizableChat({
  onClose,
  customPrompt,
}: ResizableChatProps) {
  const {width, setWidth} = useChatWidth()
  
  const resizeRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef<boolean>(false);

  const handleMouseDown = useCallback(() => {
    isResizing.current = true;
    document.body.classList.add("select-none");
  }, [])

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.body.classList.remove("select-none");
  }, []);

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current && resizeRef.current && parentRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect();
      const newWidth = parentRect.right - e.clientX;
      if (newWidth > 300 && newWidth < parentRect.right * 0.4) {
        setWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div ref={parentRef} className="flex h-screen">
      <div
        className="w-2 cursor-col-resize bg-gray-800 hover:bg-gray-500"
        ref={resizeRef}
        onMouseDown={handleMouseDown}
      />
      <div id="resizable-chat" style={{ width }} className="p-4 flex flex-col h-full bg-gray-900">
        <Chat onClose={() => {
          onClose();
          setWidth(0); // Reset width when closing chat
        }} customPrompt={customPrompt} />
      </div>
    </div>
  );
}

function Chat({ onClose, customPrompt }: ResizableChatProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const {
    chat,
    isDownloading,
    isWaitingAnswer,
    getDocumentChats,
    isLoading,
    downloadHistory,
  } = useChat();
  const { currentUserData } = useSystemLayout();

  useEffect(() => {
    if (currentUserData?.userId) {
      getDocumentChats();
    }
  }, [currentUserData?.userId]);

  useEffect(() => {
    if (!isLoading) {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }
  }, [chat]);


  return (
    <>
      <div className="flex flex-row justify-between pb-4">
        <Typography variant="h5" className="text-gray-800 font-bold">
          Chat
        </Typography>
        <div>
          <IconButton disabled={isDownloading} onClick={() => downloadHistory()}>
            {isDownloading ? (
              <CircularProgress
                className="!text-white"
                size={24}
                sx={{ margin: "0 auto" }}
              />
            ) : (
              <Download />
            )}
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      {/* Contenido del chat */}
      <div
        className="flex-1 flex-col overflow-y-auto py-2 space-y-2"
        ref={chatContainerRef}
      >
        {isLoading ? (
          <div className="flex flex-col h-full items-center justify-center py-4">
            <CircularProgress
              className="!text-white"
              size={24}
              sx={{ margin: "0 auto" }}
            />
          </div>
        ) : (
          chat.map((message, index) => (
            <div key={index}>
              <ChatMessage
                id={message.questionId}
                message={message.question}
                isAnswer={false}
                evaluation={message.evaluation}
                comment={message.comments || []}
              />
              <ChatMessage
                id={message.responseId}
                message={message.response}
                isAnswer={true}
                isWaitingAnswer={isWaitingAnswer && index === chat.length - 1}
              />
            </div>
          ))
        )}
      </div>
      {/* Input para enviar las consultas junto con el selector de modelo*/}
      <div className="flex flex-col w-full py-2 space-y-2">
        <ChatInput
          customPrompt={customPrompt}
        />
      </div>
    </>
  )
}