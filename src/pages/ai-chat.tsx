import { cn } from "@/lib/utils";
import { TChatMessage } from "@/modules/aiChat/anthropicApi";
import { AiChatForm } from "@/modules/aiChat/components/AiChatForm";
import {
  AssistantMessage,
  DisplayChatMessages,
  ErrorMessage,
} from "@/modules/aiChat/components/Messages";
import { DependencyList, useEffect, useRef, useState } from "react";

const ScrollContainer = (p: {
  children: React.ReactNode;
  deps: DependencyList;
  className?: string;
}) => {
  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollContainer.current) return;
    scrollContainer.current.scrollTop = scrollContainer.current.scrollHeight;
  }, p.deps);

  return (
    <div className={cn("overflow-y-auto", p.className)} ref={scrollContainer}>
      {p.children}
    </div>
  );
};

const AiChat = () => {
  const [mode, setMode] = useState<"ready" | "thinking" | "streaming" | "error">("ready");
  const [messages, setMessages] = useState<TChatMessage[]>([]);
  const [streamedResponse, setStreamedResponse] = useState("");

  return (
    <div className="flex h-full flex-col gap-4">
      <ScrollContainer
        deps={[messages, streamedResponse, mode]}
        className="flex flex-1 flex-col gap-4"
      >
        <AssistantMessage>Hello! How can I help you today?</AssistantMessage>

        <DisplayChatMessages messages={messages} />

        {mode === "thinking" && <p>Thinking...</p>}
        {mode === "streaming" && <AssistantMessage>{streamedResponse}</AssistantMessage>}
        {mode === "error" && <ErrorMessage />}
      </ScrollContainer>

      <AiChatForm
        messages={messages}
        onModeChange={setMode}
        onUpdatedMessages={setMessages}
        onStream={(text) => setStreamedResponse(text)}
        onComplete={(messages) => {
          setMessages(messages);
          setStreamedResponse("");
        }}
      />
    </div>
  );
};

export default AiChat;
