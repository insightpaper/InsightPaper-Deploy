"use client";
import StandaloneChat from "@/modules/documents/components/chat/StandaloneChat";
import { Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useChat } from "@/modules/chat/context/ChatContext";
import { useParams } from "next/navigation";

export default function StudentsChatPage() {
  const { studentChat, getStudentChat, getStudentChats } = useChat();
  const { studentId, courseId } = useParams<{
    studentId: string;
    courseId: string;
  }>();
  const [chatName, setChatName] = useState("");
  const [selectedChat, setSelectedChat] = useState("");

  const handleChatClick = (documentId: string) => {
    // Handle chat click event
    getStudentChat(documentId, studentId);
    setSelectedChat(documentId);
  };

  useEffect(() => {
    if (studentId && courseId) {
      getStudentChats(courseId, studentId);
    }
  }, [studentId]);

  return (
    <main className="flex flex-col w-full h-screen px-3 lg:px-6 pt-6 pb-12 overflow-hidden">
      <div className="flex flex-row w-full h-fit">
        <Typography variant="h4" className="mb-4! text-3xl!">
         Chats de estudiante
        </Typography>
      </div>
      <div className="flex flex-row w-full h-full gap-4">
        <div className="flex flex-col w-80 min-w-80 h-full">
          <div className="flex flex-col w-full rounded-lg shadow-md gap-2 overflow-auto">
            {studentChat.map((chat) => (
              <div
                onClick={() => {
                  handleChatClick(chat.documentId);
                  setChatName(chat.documentTitle);
                }}
                className={`${chat.documentId == selectedChat ? "bg-gray-700": "bg-primary-900"} flex flex-col w-full h-fit  hover:bg-primary-800 rounded-lg p-4`}
                key={chat.documentId}
              >
                <Typography variant="h5" className="hover:cursor-pointer text-xl!">
                  {chat.documentTitle}
                </Typography>
                <Typography variant="body1" className="text-sm! text-gray-300!">
                  Preguntas realizadas: {chat.questionCount}
                </Typography>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col w-full min-h-full">
          <StandaloneChat chatName={chatName} documentId={selectedChat} />
        </div>
      </div>
    </main>
  );
}
