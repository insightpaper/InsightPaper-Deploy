"use client";
import { CircularProgress, IconButton, Typography } from "@mui/material";
import React from "react";
import { Download } from "@mui/icons-material";
import ChatMessage from "./ChatMessage";
import { useChat } from "@/modules/chat/context/ChatContext";

interface StandaloneChatProps {
  chatName: string;
  documentId?: string;
}

export default function StandaloneChat({ chatName, documentId }: StandaloneChatProps) {
  const { chat, isDownloading, isWaitingAnswer, isLoading, downloadHistory } =
    useChat();
  const handleDownload = async () => {
    if (isDownloading) return;
    try {
      await downloadHistory(documentId);
    } catch (error) {
      console.error("Error downloading chat history:", error);
    }
  }
  return (
    <div className="flex h-full w-full">
      {/* Para no crear un nuevo estado para almacenar si esta sin seleccionar 
      partimos del hecho de que cada chat que aparece en esta seccion siempre tendra
      mensajes o por lo menos una pregunta.*/}
      {!chatName ? (
        <div className="flex flex-col w-full h-full items-center justify-center bg-gray-900">
          <Typography variant="h6" className="max-sm:text-base! !text-gray-500 text-center! px-5!">
            Seleccione un chat para ver los mensajes
          </Typography>
        </div>
      ) : chat.length === 0 && chatName ? (
        <div className="flex flex-col w-full h-full items-center justify-center bg-gray-900">
          <Typography variant="h6" className="!text-gray-500">
            No hay mensajes en el chat
          </Typography>
        </div>
      ) : (
        <div className="p-4 flex flex-col w-full h-full bg-gray-900">
          <div className="flex flex-row justify-between pb-4">
            <Typography variant="h5" className="text-gray-800 font-bold">
              {chatName}
            </Typography>
            <div>
              <IconButton disabled={isDownloading} onClick={handleDownload}>
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
            </div>
          </div>
          {/* Contenido del chat */}
          <div className="flex-1 flex-col overflow-y-auto py-2 space-y-2">
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
                    isWaitingAnswer={
                      isWaitingAnswer && index === chat.length - 1
                    }
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Input para enviar las consultas junto con el selector de modelo
                <div className="flex flex-col w-full py-2 space-y-2">
                  <ChatInput
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                    onSend={sendMessage}
                    isLoading={isWaitingAnswer}
                  />
                  
                </div>
                */}
    </div>
  );
}
