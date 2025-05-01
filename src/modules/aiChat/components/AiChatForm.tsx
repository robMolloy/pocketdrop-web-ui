import { callClaude, TChatMessage, TChatMessageContent } from "../anthropicApi";
import { convertFilesToFileDetails } from "../utils";
import { AiInputTextAndImages } from "./AiInputTextAndImages";
import { useEffect, useState } from "react";

const uuid = () => crypto.randomUUID();

const createAssistantMessage = (text: string): TChatMessage => {
  return { id: uuid(), role: "assistant", content: [{ type: "text", text }] };
};

const createUserMessage = (content: TChatMessageContent): TChatMessage => {
  return { id: uuid(), role: "user", content };
};

export const AiChatForm = (p: {
  messages: TChatMessage[];
  onUpdatedMessages: (messages: TChatMessage[]) => void;
  onModeChange: (mode: "ready" | "thinking" | "streaming" | "error") => void;
  onStream: (text: string) => void;
  onComplete: (messages: TChatMessage[]) => void;
}) => {
  const [currentInput, setCurrentInput] = useState("");
  const [currentImages, setCurrentImages] = useState<File[]>([]);

  const [mode, setMode] = useState<"ready" | "thinking" | "streaming" | "error">("ready");
  useEffect(() => p.onModeChange(mode), [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "thinking" || mode === "streaming") return;
    setMode("thinking");

    const newUserMessage = createUserMessage([
      { type: "text", text: currentInput },
      ...(await convertFilesToFileDetails(currentImages)),
    ]);

    const updatedMessages = [...p.messages, newUserMessage];

    p.onUpdatedMessages(updatedMessages);
    setCurrentInput("");
    setCurrentImages([]);

    const resp = await callClaude({
      messages: updatedMessages.map((x) => ({ role: x.role, content: x.content })),
      onFirstStream: () => setMode("streaming"),
      onStream: (text) => p.onStream(text),
    });

    if (!resp.success) return setMode("error");

    setMode("ready");
    p.onComplete([...updatedMessages, createAssistantMessage(resp.data)]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <AiInputTextAndImages
        disabled={mode === "thinking" || mode === "streaming"}
        text={currentInput}
        onInputText={setCurrentInput}
        images={currentImages}
        onInputImages={setCurrentImages}
      />
    </form>
  );
};
