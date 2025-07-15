import { IconButton, InputBase, MenuItem, TextField } from "@mui/material";
import { Send } from "@mui/icons-material";
import { useChat } from "@/modules/chat/context/ChatContext";
import { useEffect, useState } from "react";

interface ChatInputProps {
  customPrompt?: string;
}

export default function ChatInput({
  customPrompt
}: ChatInputProps) {
  const { selectedModel, setSelectedModel, sendQuestion, isLoading, models } = useChat();
  const [inputValue, setInputValue] = useState("");

  const handleSendQuestion = async () => {
    if (inputValue.trim() === "") return;

    try {
      await sendQuestion(inputValue);
      setInputValue("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  useEffect(()=>{
    if (customPrompt && customPrompt.trim() !== "") {
      setInputValue(customPrompt);
    }
  }, [customPrompt])

  return (
    <div className="relative bg-gray-800 rounded-xl p-3">
      <InputBase
        placeholder="Escribe tu mensaje..."
        className={`text-white w-full pb-4! ${isLoading ? "opacity-50 animate-pulse": ""}`}
        multiline
        maxRows={5}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        sx={{ "& .MuiInputBase-input": { padding: 0 } }}
      />

      <TextField
        size="small"
        select
        variant="outlined"
        className="w-40 text-white mt-2"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        {models.map((model, index) => (
          <MenuItem key={index} value={model.providerName}>
            {model.modelName}
          </MenuItem>
        ))}
      </TextField>

      <IconButton
        size="medium"
        className="!absolute bottom-2 right-2 !bg-gray-700 hover:!bg-gray-600"
        onClick={handleSendQuestion}
        disabled={isLoading || inputValue.trim() === ""}
      >
        <Send fontSize="small" />
      </IconButton>
    </div>
  );
}
