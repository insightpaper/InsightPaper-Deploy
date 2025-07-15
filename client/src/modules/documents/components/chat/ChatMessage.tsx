// components/chat/ChatMessage.tsx
import React, { useEffect, useState } from "react";
import { Skeleton, IconButton, Typography } from "@mui/material";
import {
  ArrowDropDown,
  ArrowRight,
  ThumbDown,
  ThumbDownOutlined,
  ThumbUp,
  ThumbUpOutlined,
} from "@mui/icons-material";
import MarkdownRenderer from "./MarkdownRenderer";
import CommentInput from "./comments/CommentInput";
import { useChat } from "@/modules/chat/context/ChatContext";

import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";
import CommentMessage from "./comments/CommentMessage";

interface Comment {
  isPrivate: boolean;
  commentary: string;
}


interface Props {
  id: string;
  message: string;
  isAnswer: boolean;
  evaluation?: boolean;
  isWaitingAnswer?: boolean;
  comment?: Comment[];   // Deberia ser un arreglo pero que mas da.
}

export default function ChatMessage({
  id,
  message,
  isAnswer,
  evaluation,
  isWaitingAnswer,
  comment
}: Props) {
  const [open, setOpen] = useState(false);
  const [skeletonCount, setSkeletonCount] = useState(1);
  const [evalState, setEvalState] = useState<boolean | undefined>(evaluation);
  const { evaluateResponse, addComment } = useChat();
  const { isUserIs } = useSystemLayout();

  useEffect(() => {
    if (isWaitingAnswer) {
      const interval = setInterval(() => {
        setSkeletonCount((prev) => (prev < 5 ? prev + 1 : prev));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isWaitingAnswer]);

  const handleEvaluation = async (val: boolean) => {
    const success = await evaluateResponse(id, val);
    if (success) setEvalState(val);
  };

  const handleSubmitComment = async ({ comment, isPrivate }: { comment: string; isPrivate: boolean }) => {
    const res = await addComment(id, comment, isPrivate)
    return res;
  }

  if (isWaitingAnswer) {
    return (
      <div className="flex flex-col items-start w-full p-2">
        <div className="w-fit min-w-[80%] max-w-[85%] bg-gray-800 text-white rounded-sm p-2">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <Skeleton key={i} variant="text" height={24} className="mb-1" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col ${!isAnswer ? "items-end" : "items-start"} w-full p-2`}
    >
      <div className="w-fit min-w-[80%] max-w-[85%] bg-gray-800 text-white rounded-sm p-4">
        <MarkdownRenderer content={message} />
        <div className="flex justify-between items-center my-1">
          <IconButton onClick={() => setOpen((prev) => !prev)}>
            <Typography variant="body2" className="text-gray-400">
              Comentarios
            </Typography>
            {open ? <ArrowDropDown /> : <ArrowRight />}
          </IconButton>
          {!isAnswer && isUserIs.Professor && (
            <div className="flex gap-2">
              <IconButton onClick={() => handleEvaluation(true)}>
                {evalState === true ? <ThumbUp /> : <ThumbUpOutlined />}
              </IconButton>
              <IconButton onClick={() => handleEvaluation(false)}>
                {evalState === false ? <ThumbDown /> : <ThumbDownOutlined />}
              </IconButton>
            </div>
          )}
        </div>
      </div>
      {open && comment && (
        <div className={`flex flex-col ${!isAnswer ? "items-end" : "items-start"} w-full mt-2`}>
          <div className={`flex flex-col w-fit min-w-[70%] max-w-[75%] ${!isAnswer ? "items-end" : "items-start"} p-2 gap-4`}>
              {comment.map((comment, index) =>(
                <CommentMessage
                key={index}
                message={comment.commentary}
                isPrivate={comment.isPrivate || false}  // Este es un caso donde no viene el isPrivate, generalmente los chats de los estudiantes no tienen comentarios privados
                isProfessor={false}
              />))}
              {isUserIs.Professor && (
            <CommentInput 
            onSubmit={handleSubmitComment}
            />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
