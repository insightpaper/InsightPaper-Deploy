import React  from "react";
import { Typography, Chip } from "@mui/material";

interface CommentMessageProps {
  message: string;
  isPrivate: boolean;
  isProfessor: boolean;
}

export default function CommentMessage({ message, isPrivate }: CommentMessageProps){
  return (
  <div className="flex flex-col bg-gray-800 rounded-lg w-full p-4">
    <div className="flex flex-row w-full justify-between mb-4">
      <Typography variant="h6" className="text-white">
        Profesor {/* Aqui depende si queremos que un usuario pueda añadir comentarios */}
      </Typography>
      {isPrivate && (
        <Chip label="Privado"/>
      )}
    </div>
    <div className="flex flex-row w-full">
      <p className="text-sm text-white">{message}</p>
    </div>
  </div>
  )
}