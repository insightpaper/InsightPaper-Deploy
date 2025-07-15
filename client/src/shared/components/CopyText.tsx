"use client";
import { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

interface CopyTextProps {
  text: string;
  tooltipText?: string;
  className?: string;
}

export default function CopyText({
  text,
  tooltipText = "Copy",
  className,
}: CopyTextProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <Tooltip title={isCopied ? "Copied!" : tooltipText} arrow>
      <IconButton
        size="small"
        onClick={handleCopy}
        color={isCopied ? "success" : "primary"}
        className={className}
      >
        {isCopied ? <CheckIcon /> : <ContentCopyIcon />}
      </IconButton>
    </Tooltip>
  );
}
