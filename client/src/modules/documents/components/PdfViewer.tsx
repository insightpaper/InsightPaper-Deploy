"use client";
import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useRef, useState } from "react";
import { Button, Divider, Popover } from "@mui/material";
import { Chat, ContentCopy, Edit } from "@mui/icons-material";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useChatWidth } from "@/modules/chat/context/ChatWidthContext";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.mjs`;

interface PDFViewerProps {
  url: string;
  onConsultIA: (text: string) => void;
}

export default function PDFViewer({ url, onConsultIA }: PDFViewerProps) {
  const {width: adjustedChatWidth} = useChatWidth();
  const [selectedText, setSelectedText] = useState("");
  const [anchorPosition, setAnchorPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sidebarWidth = 220;

    const updateWidth = () => {
      const totalWidth = window.innerWidth;
      setContainerWidth(totalWidth - sidebarWidth - adjustedChatWidth - 48);
    };

    updateWidth(); // inicial

    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, [adjustedChatWidth]);

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    const text = window.getSelection()?.toString() || "";
    if (text.trim() !== "") {
      setSelectedText(text);
      setAnchorPosition({ top: e.clientY, left: e.clientX });
    } else {
      setAnchorPosition(null);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      setAnchorPosition(null);
      notifySuccess("Texto copiado al portapapeles");
    } catch {
      notifyError("Error al copiar el texto");
    }
  };

  const handleConsult = () => {
    try {
      onConsultIA(selectedText);
      setAnchorPosition(null);
    } catch {
      notifyError("Error al consultar a la IA");
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-primary-950 rounded shadow overflow-y-auto px-4"
      onMouseUp={handleMouseUp}
    >
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<div className="text-white p-4">Cargando documento...</div>}
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={`page_${i + 1}`}
            pageNumber={i + 1}
            width={containerWidth}
            className="mb-4"
          />
        ))}
      </Document>

      <Popover
        open={!!anchorPosition}
        onClose={() => setAnchorPosition(null)}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition || undefined}
        PaperProps={{
          className:
            "bg-[#25232A] rounded-2xl! p-0 flex flex-col space-y-2 w-48",
          elevation: 4,
        }}
      >
        <Button
          className="flex justify-start! space-x-2 p-2 rounded-xl hover:bg-primary-700! transition-colors text-white!"
          onClick={() => {
            setAnchorPosition(null);
          }}
        >
          <Edit fontSize="small" />
          <span>Resaltar</span>
        </Button>

        <Button
          className="flex justify-start! space-x-2 p-2 rounded-xl hover:bg-primary-700! transition-colors text-white!"
          onClick={handleConsult}
        >
          <Chat fontSize="small" />
          <span className="whitespace-nowrap">Consultar a IA</span>
        </Button>

        <Divider className="bg-gray-600 my-1" />

        <Button
          className="flex justify-start! space-x-2 p-2 rounded-xl hover:bg-primary-700! transition-colors text-white!"
          onClick={handleCopy}
        >
          <ContentCopy fontSize="small" />
          <span>Copiar</span>
        </Button>
      </Popover>
    </div>
  );
}
