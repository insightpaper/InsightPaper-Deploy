"use client";
import dynamic from "next/dynamic";
import ResizableChat from "@/modules/documents/components/chat/Chat";
import { useDocuments } from "@/modules/documents/context/DocumentsProvider";
import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";
import { Chat } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useChatWidth } from "@/modules/chat/context/ChatWidthContext";

// ✅ Importación dinámica sin SSR para evitar errores del visor PDF
const PDFViewer = dynamic(() => import("@/modules/documents/components/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="py-10 flex items-center justify-center h-full w-full">
      <CircularProgress />
    </div>
  ),
});

export default function ContentPage({ documentId }: { documentId: string }) {
  console.log(`Este es el documentId desde ContentPage`, documentId);
  const {setWidth} = useChatWidth()
  const [openChat, setOpenChat] = useState<boolean>(false);
  const { isDataLoading, document } = useDocuments();
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const { isUserIs } = useSystemLayout()
  const router = useRouter();

  const toggleChat = () => {
    if (!openChat) {
      // Si el chat se está cerrando, restablecemos el ancho a 400px
      setWidth(400);
    }
    setOpenChat((prev) => !prev);
  };

  const handleConsultIA = (text: string) => {
    setCustomPrompt(text);
    if (text.trim() !== "") {
      setOpenChat(true);
      setWidth(400); // Ajustamos el ancho del chat al abrirlo
    }
  };

  return (
    <div className="w-full flex flex-row flex-nowrap gap-4">
      <div className="w-full">
        {isDataLoading && (
          <div className="py-10 flex items-center justify-center h-full w-full">
            <CircularProgress />
          </div>
        )}

        {!isDataLoading && document?.firebaseUrl && (
          <PDFViewer
            url={`/api/pdf-proxy?url=${encodeURIComponent(document.firebaseUrl)}`}
            onConsultIA={handleConsultIA}
          />
        )}

        {!document?.firebaseUrl && !isDataLoading && (
          <div className="flex flex-col items-center justify-center h-full py-20 w-full">
            <h1 className="text-2xl font-bold">Documento no encontrado</h1>
            <p className="text-gray-500 mt-5">Por favor, sube un documento para verlo</p>
            <Button
              variant="contained"
              color="primary"
              className="mt-5!"
              onClick={() => router.back()}
            >
              Volver a documentos
            </Button>
          </div>
        )}
      </div>

      {isUserIs.Student && document?.documentId && (openChat ? (
        <ResizableChat onClose={toggleChat} customPrompt={customPrompt} />
      ) : (
        <button
          className="fixed bottom-5 right-5 z-50 aspect-square rounded-full bg-sky-950 text-white p-3"
          onClick={toggleChat}
        >
          <Chat />
        </button>
      ))}
    </div>
  );
}
