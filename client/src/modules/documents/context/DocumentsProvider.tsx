"use client";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { apiRequest } from "@/shared/utils/request/apiRequest";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { createContext, useContext } from "react";
import { useParams, usePathname } from "next/navigation";
import { DocumentItem } from "@/shared/interfaces/Documents";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "@/shared/services/firebaseService";

type FileWithMeta = {
  file: File;
  progress: number;
  uploaded: boolean;
  title: string;
  description: string;
  isEditing: boolean;
  labels: string[];
};

interface DocumentContextType {
  totalPages: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  rowsPerPage: number;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  orderDirection: "ASC" | "DESC";
  setOrderDirection: Dispatch<SetStateAction<"ASC" | "DESC">>;
  orderBy: string | undefined;
  setOrderBy: Dispatch<SetStateAction<string | undefined>>;
  documents: DocumentItem[];
  document: DocumentItem | null;
  documentHistory: DocumentHistoryItem[];
  isDataLoading: boolean;
  getDocuments: () => Promise<void>;
  uploadDocument: (
    file: FileWithMeta,
    onProgressUpdate?: (progress: number) => void
  ) => Promise<void>;
  getDocumentHistory: (documentId: string) => Promise<void>;
  editDocument: (fileData: DocumentItem) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  searchDocuments: (
    question: string,
    method: "search" | "context"
  ) => Promise<void>;
  sendRecommendation: (documentId: string) => Promise<void>;
}

interface DocumentHistoryItem {
  historyId: number;
  documentId: string;
  createdDate: string;
  title: string;
  description: string;
  labels: string[];
}

//TODO: Moverlo a otro archivo
/*
{
            "questionId": "6407CAFD-286C-44CE-92D3-321EB9D96A48",
            "question": "Hola como estas",
            "responseId": "862D27A0-8685-40D1-844F-BB7392F7FC3F",
            "response": "Buenas tardes",
            "evaluation": true,
            "questionCreatedDate": "2025-04-30T23:20:40.427",
            "questionModifiedDate": "2025-04-30T23:20:40.427",
            "responseCreatedDate": "2025-04-30T23:39:36.960",
            "responseModifiedDate": "2025-04-30T23:39:36.960"
        },


*/

export const DocumentsContext = createContext<DocumentContextType | null>(null);

export const useDocuments = () => {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error("useDocuments must be used within a DocumentsProvider");
  }
  return context;
};

function DocumentsProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [orderDirection, setOrderDirection] = useState<"ASC" | "DESC">("ASC");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<string | undefined>("createdDate");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [documentHistory, setDocumentHistory] = useState<DocumentHistoryItem[]>(
    []
  );
  const { courseId, documentId } = useParams<{
    courseId: string;
    documentId: string;
  }>();
  const pathname = usePathname();
  const isStudentRoute = pathname.includes("/student");

  const getDocuments = async () => {
    setIsDataLoading(true);
    try {
      const params = {
        pageNumber: page,
        pageSize: rowsPerPage,
        ...(orderDirection !== undefined && { orderDirection }),
        ...(orderBy !== undefined && { orderBy }),
        ...(page && { pageNumber: page }),
        ...(rowsPerPage && { pageSize: rowsPerPage }),
      };
      const res = await apiRequest<{
        result: {
          documents: DocumentItem[];
          totalPages: number;
        };
      }>({
        method: "get",
        url: isStudentRoute
          ? "/api/documents/studentDocuments"
          : `/api/courses/documents/${courseId}`,
        params,
      });
      console.log("Documents fetched:", res);
      setDocuments(res.result.documents);
      setTotalPages(res.result.totalPages);
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsDataLoading(false);
    }
  };

  const getDocument = async (documentId: string) => {
    setIsDataLoading(true);
    try {
      const res = await apiRequest<{
        result: DocumentItem[];
      }>({
        method: "get",
        url: `/api/courses/documentsId/${documentId}`,
      });
      if (res.result.length === 0) {
        notifyError("No se ha encontrado el documento");
      } else {
        setDocument(res.result[0]); //TODO: Cambiar el return por el de la ruta
      }
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsDataLoading(false);
    }
  };

  const getDocumentHistory = async (documentId: string) => {
    //setIsDataLoading(true);
    try {
      const res = await apiRequest<{
        result: DocumentHistoryItem[];
      }>({
        method: "get",
        url: `/api/courses/history/${documentId}`,
      });
      setDocumentHistory(res.result); //TODO: Cambiar el return por el de la ruta
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    } finally {
      //setIsDataLoading(false);
    }
  };

  /**
   * Son dos tareas, la primera subir el docu a firebase y obtener su url
   * La segunda es subir la url con la metadata del documento a la base de datos
   * @param file
   * @param onProgressUpdate Callback opcional para actualizar el progreso de carga
   */
  const uploadDocument = async (
    file: FileWithMeta,
    onProgressUpdate?: (progress: number) => void
  ) => {
    try {
      // Creamos una referencia especifica al documento, porque sino nno podremos obtener la url

      const fileRef = ref(
        storage,
        `documents/${courseId ?? "personal"}/${Date.now()}_${file.title}`
      );

      if (onProgressUpdate) {
        // Usar uploadBytesResumable para monitorear el progreso
        const uploadTask = uploadBytesResumable(fileRef, file.file);

        // Configurar el listener de progreso
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            onProgressUpdate(progress);
          },
          (error) => {
            console.log("Error durante la subida:", error);
            notifyError("Error al subir el archivo");
          }
        );

        // Esperar a que termine la carga
        await uploadTask;
        // Obtener la URL
        const url = await getDownloadURL(fileRef);

        await addDocumentToDatabase(file, url);
        notifySuccess("Documento subido correctamente");
        getDocuments();
      } else {
        // Comportamiento anterior sin seguimiento de progreso
        const snap = await uploadBytes(fileRef, file.file);
        const url = await getDownloadURL(snap.ref);

        await addDocumentToDatabase(file, url);
        notifySuccess("Documento subido correctamente");
        getDocuments();
      }
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    }
  };

  const addDocumentToDatabase = async (file: FileWithMeta, url: string) => {
    try {
      const res = await apiRequest<{
        result: boolean;
      }>({
        method: "post",
        url: isStudentRoute
          ? "/api/documents/studentDocument"
          : `/api/courses/documents/`,
        data: {
          courseId: courseId,
          title: file.title,
          description: file.description,
          labels: JSON.stringify(file.labels),
          firebaseUrl: url,
        },
      });
      console.log(res);
    } catch (error) {
      throw new Error(error as string);
    }
  };

  const editDocument = async (fileData: DocumentItem) => {
    try {
      const res = await apiRequest<{
        result: boolean;
      }>({
        method: "put",
        url: isStudentRoute
          ? `/api/documents/studentDocuments/${fileData.documentId}`
          : `/api/courses/documents/`,
        data: {
          documentId: fileData.documentId,
          title: fileData.title,
          description: fileData.description,
          labels: JSON.stringify(fileData.labels),
          firebaseUrl: fileData.firebaseUrl,
        },
      });
      if (res.result) {
        notifySuccess("Documento editado correctamente");
        getDocuments();
      } else {
        // Aqui tengo que cambiarlo por el mensaje generico
        notifyError("Error al editar el documento");
      }
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // Como se trabaja con borrado logico, lo que haremos es eliminar el documento de la base de datos
      const res = await apiRequest<{
        result: boolean;
      }>({
        method: "delete",
        url: isStudentRoute
          ? `/api/documents/studentDocuments/${documentId}`
          : `/api/documents/deleteDocument/${courseId}/${documentId}`,
      });
      console.log(res);
      notifySuccess("Documento eliminado correctamente");
      getDocuments();
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    }
  };

  const searchDocuments = async (
    question: string,
    method: "search" | "context"
  ) => {
    setIsDataLoading(true);
    try {
      const res = await apiRequest<{ documents: DocumentItem[] }>({
        method: "post",
        url:
          method === "search"
            ? `/api/questions/gptSearch/${courseId}`
            : `/api/questions/gptFullContext/${courseId}`,
        data: {
          question,
          documentsNumber: 5,
        },
      });
      
      setDocuments(res.documents);
    } catch (error) {
      console.log("Error al obtener los documentos", error);
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsDataLoading(false);
    }
  };

  const sendRecommendation = async (documentId: string) => {
    try {
      const res = await apiRequest<{
        lastNotificationId: string;
      }>({
        method: "post",
        url: `/api/users/recommendation/${courseId}/${documentId}`,
      });
      if (res.lastNotificationId) {
        notifySuccess("Recomendación enviada correctamente");
      } else {
        notifyError("No se pudo enviar la recomendación");
      }
    } catch (error) {
      console.log("Error al enviar la recomendación", error);
      notifyError(getErrorMessage(error as string));
    }
  };

  useEffect(() => {
    if (courseId !== undefined && !isStudentRoute) {
      //console.log(`Este es el courseId desde el documents ${courseId}`);
      getDocuments();
    }
  }, [courseId, page, rowsPerPage, orderDirection, orderBy]);

  useEffect(() => {
    if (documentId !== undefined) {
      //console.log(`Este es el documentId desde el documents ${documentId}`);
      getDocument(documentId);
    }
  }, [documentId]);

  return (
    <DocumentsContext.Provider
      value={{
        totalPages,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        orderDirection,
        setOrderDirection,
        orderBy,
        setOrderBy,
        documents,
        document,
        documentHistory,
        isDataLoading,
        uploadDocument,
        editDocument,
        deleteDocument,
        getDocumentHistory,
        getDocuments,
        searchDocuments,
        sendRecommendation,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
}

export default DocumentsProvider;
