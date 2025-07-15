"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { apiRequest } from "@/shared/utils/request/apiRequest";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";
import { useParams } from "next/navigation";
import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";
import axiosInstance from "@/shared/services/axiosService";

// Chat message interface
export interface ChatItem {
  questionId: string;
  question: string;
  responseId: string;
  response: string;
  evaluation: boolean;
  questionCreatedDate: string;
  questionModifiedDate: string;
  responseCreatedDate: string;
  responseModifiedDate: string;
  comments?: CommentItem[]; // Array of comments for the question
}

// Comment interface (for future implementation)
export interface CommentItem {
  isPrivate: boolean;
  commentary: string;
}
// Intefaz para almacenar los chats de los estudiantes
export interface StudentChatItem {
  documentId: string;
  documentTitle: string;
  questionCount: number;
}

export interface ModelItem {
  modelName: string;
  providerName: string;
}

// Context interface definition
interface ChatContextType {
  chat: ChatItem[];
  models: ModelItem[];
  studentChat: StudentChatItem[];
  isLoading: boolean;
  isDownloading: boolean;
  isWaitingAnswer: boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  getDocumentChats: () => Promise<void>;
  sendQuestion: (question: string) => Promise<void>;
  evaluateResponse: (
    responseId: string,
    evaluation: boolean
  ) => Promise<boolean>;
  getStudentChats: (courseId: string, studentId: string) => Promise<void>;
  getStudentChat: (documentId: string, studentId: string) => Promise<void>;
  // Future implementation placeholders
  addComment: (messageId: string, comment: string, isPrivate: boolean) => Promise<boolean>;
  getComments: (messageId: string) => Promise<CommentItem[]>;
  downloadHistory: (propDocumentId?: string) => Promise<void>;
}

// Create the context
export const ChatContext = createContext<ChatContextType | null>(null);

// Create a hook to use the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

// Chat Provider component
export default function ChatProvider({ children }: { children: ReactNode }) {
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [studentChat, setStudentChat] = useState<StudentChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isWaitingAnswer, setIsWaitingAnswer] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const { documentId, studentId } = useParams<{ documentId: string, studentId: string }>();
  const { currentUserData } = useSystemLayout();


  // Get chats for a document
  const getDocumentChats = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{
        result: ChatItem[];
      }>({
        method: "get",
        url: `/api/questions/${documentId}`,
      });
      setChat(res.result);
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsLoading(false);
    }
  };

  // Get chats for a specific course and student
  const getStudentChats = async (courseId: string, studentId: string) => {
    setIsLoading(true);
    try {
      console.log("Dentro del getStudentChats", courseId, studentId);
      const res = await apiRequest<{
        result: StudentChatItem[];
      }>({
        method: "get",
        url: `/api/questions/chats/${courseId}/student/${studentId}`,
      });
      setStudentChat(res.result);
      console.log(res);
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsLoading(false);
    }
  };

  const getStudentChat = async (documentId: string, studentId: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{
        result: ChatItem[];
      }>({
        method: "get",
        url: `/api/questions/chat/${documentId}/student/${studentId}`,
      });
      setChat(res.result);
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsLoading(false);
    }
  };

  // Get chats for a document (overloaded function)
  const downloadHistory = async (propDocumentId?: string) => {
    setIsDownloading(true);
    try {
      // const res = await apiRequest<{
      //   result: ChatItem[];
      // }>({
      //   method: "get",
      //   url: `/api/questions/downloadHistory/${documentId}`,
      //   data: {
      //     studentId: userId,
      //   },
      // });
      const apiUrl = studentId 
      ? `/api/questions/downloadHistory/${propDocumentId}/student/${studentId}` 
      : `/api/questions/downloadHistory/${documentId ?? propDocumentId}`;
      const response = await axiosInstance.get(
        apiUrl,
        {
          responseType: "blob",
        }
      );

      const today = new Date().toISOString().split("T")[0];

      const filename = "Historial_Chat_" + today + ".xlsx";

      // Create a Blob from the response data
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a link element
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;

      // Trigger the download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.log("Error downloading history:", error);
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsDownloading(false);
    }
  };

  // Send a new question
  const sendQuestion = async (question: string) => {
    try {
      setIsWaitingAnswer(true);
      setChat((prevChat) => [
        ...prevChat,
        {
          questionId: "",
          question: question,
          responseId: "",
          response: "",
          evaluation: false,
          questionCreatedDate: new Date().toISOString(),
          questionModifiedDate: new Date().toISOString(),
          responseCreatedDate: "",
          responseModifiedDate: "",
        },
      ]);
      const res = await apiRequest<{
        result: string;
      }>({
        method: "post",
        url: `/api/questions/chat/${documentId}`,
        data: {
          question: question,
          model: selectedModel, // We'll send the selected model to the API
        },
      });
      console.log(res);
      // Refresh the chat after sending a question
      if (currentUserData?.userId) {
        setIsWaitingAnswer(false);
        await getDocumentChats();
      }
    } catch (error) {
      console.log("Error sending question:", error);
      setChat((prevChat) =>
        prevChat.filter((item) => item.question !== question)
      );
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsWaitingAnswer(false);
    }
  };

  // Evaluate a response (thumbs up/down)
  const evaluateResponse = async (responseId: string, evaluation: boolean) => {
    try {
      await apiRequest<{
        result: string;
      }>({
        method: "put",
        url: `/api/questions/${responseId}`,
        data: {
          evaluation: evaluation,
        },
      });

      // Update the chat item in the local state
      setChat((prevChat) =>
        prevChat.map((item) =>
          item.responseId === responseId
            ? { ...item, evaluation: evaluation }
            : item
        )
      );

      return true;
    } catch (error) {
      notifyError(getErrorMessage(error as string));
      return false;
    }
  };

  // Add a comment to a message (placeholder for future implementation)
  const addComment = async (questionId: string, comment: string, isPrivate: boolean) => {
    try {
      await apiRequest<{
        result: string;
      }>({
        method: "post",
        url: `/api/questions/comment/${questionId}`,
        data: {
          comment: comment,
          isPrivate: isPrivate,
        },
      });
      setChat((prevChat) =>
        prevChat.map((item) => 
          item.questionId === questionId
            ? { ...item,
               comments: [...(item.comments || []), {commentary: comment, isPrivate}] 
              }
            : item
        )
      );
      notifySuccess("Comentario añadido correctamente");
      return true;
    } catch (error) {
      notifyError(getErrorMessage(error as string));
      return false;
    }
  };

  // Get comments for a message (placeholder for future implementation)
  const getComments = async (messageId: string): Promise<CommentItem[]> => {
    try {
      // This is a placeholder for future implementation
      const res = await apiRequest<{
        result: CommentItem[];
      }>({
        method: "get",
        url: `/api/comments/${messageId}`,
      });
      return res.result;
    } catch (error) {
      notifyError(getErrorMessage(error as string));
      return [];
    }
  };

  const getModels = async () => {
    try {
      const res = await apiRequest<{ result: ModelItem[] }>({
        method: "get",
        url: `/api/models`,
      });
      setModels(res.result);
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    }
  };

  // Load chats when the component mounts or documentId changes
  useEffect(() => {
    if (documentId && currentUserData?.userId) {
      getDocumentChats();
      getModels();
    }
  }, [documentId, currentUserData?.userId]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        models,
        studentChat,
        isLoading,
        isDownloading,
        isWaitingAnswer,
        selectedModel,
        setSelectedModel,
        getDocumentChats,
        sendQuestion,
        evaluateResponse,
        addComment,
        getComments,
        getStudentChats,
        getStudentChat,
        downloadHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
