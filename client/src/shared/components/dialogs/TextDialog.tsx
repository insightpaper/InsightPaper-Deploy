import { useState } from "react";
import Dialog from "./Dialog";
import { IconButton } from "@mui/material";
import NotesIcon from "@mui/icons-material/Notes";

interface TextDialogProps {
  title: string;
  text: string;
}

export default function TextDialog({ title, text }: TextDialogProps) {
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen(!open);
  };
  return (
    <>
      <IconButton onClick={handleToggle} size="small">
        <NotesIcon />
      </IconButton>
      <Dialog header={title} open={open} setOpen={setOpen}>
        <div className="flex my-3 z-20 !bg-primary-800 items-center justify-center p-4 overflow-y-auto h-full lg:max-h-[300px] rounded-md border border-primary-600 break-words overflow-wrap break-all">
          {text}
        </div>
      </Dialog>
    </>
  );
}
