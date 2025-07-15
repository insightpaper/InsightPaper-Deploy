import React  from "react";
import { useState } from "react";
import { IconButton, InputBase } from "@mui/material";
import { Send } from "@mui/icons-material";
import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";
import { FormGroup, FormControlLabel, Switch } from "@mui/material";

interface CommentInputProps {
  onSubmit: (args: {comment: string, isPrivate: boolean}) => Promise<boolean>;
}

export default function CommentInput({ onSubmit }: CommentInputProps) {
  const [comment, setComment] = useState("");
  const [isPrivate, setIsPrivate] = useState(false); 
  const { isUserIs } = useSystemLayout();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() === "") return;

    // Limpiar el campo de comentario después de enviar
    const res = await onSubmit({
      comment: comment.trim(),
      isPrivate: isPrivate,
    })
    if (res) {
      setComment("");
      setIsPrivate(false);
    }
  }

  return (
    <div className="flex flex-col bg-gray-800 rounded-lg w-full px-4 py-2">
      <div className="flex flex-row gap-2">
        <InputBase
          placeholder="Escribe un comentario..."
          className="text-white w-full"
          multiline
          maxRows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ "& .MuiInputBase-input": { padding: 0 } }}
        />
        <IconButton
          size="medium"
          className="!bg-gray-700 h-fit hover:!bg-gray-600"
          onClick={handleSubmitComment}
          disabled={!comment.trim()}
          >
          <Send fontSize="small" />
        </IconButton>
      </div>
      {isUserIs.Professor && (
      <div className="flex flex-row">
        <FormGroup>
          <FormControlLabel control={
            <Switch
              aria-label="Respuesta privada"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
          }
            label="Respuesta privada"
          />
        </FormGroup>
      </div>
      )}
    </div>
  )
}