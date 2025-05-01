import { callClaude, TChatMessage, TChatMessageContentImage } from "@/modules/aiChat/anthropicApi";
import { AiInputTextAndImages } from "@/modules/aiChat/components/AiInputTextAndImages";
import { AssistantMessage, ErrorMessage, UserMessage } from "@/modules/aiChat/components/Messages";
import { useEffect, useRef, useState } from "react";

const uuid = () => crypto.randomUUID();

const convertFileToBase64 = async (file: File) => {
  const resp = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return resp.replace("data:image/png;base64,", "");
};

const convertFileToImagePngChatMessage = async (file: File) => {
  const data = await convertFileToBase64(file);
  return {
    type: "image",
    source: { type: "base64", media_type: "image/png", data },
  } as TChatMessageContentImage;
};

const AiChat = () => {
  const [mode, setMode] = useState<"ready" | "thinking" | "streaming" | "error">("ready");
  const [messages, setMessages] = useState<TChatMessage[]>([]);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [currentImages, setCurrentImages] = useState<File[]>([]);
  const scrollContainer = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!scrollContainer.current) return;
    scrollContainer.current.scrollTop = scrollContainer.current.scrollHeight;
  }, [messages, streamedResponse]);

  useEffect(() => {
    (async () => {
      for (const image of currentImages) {
        const resp = await convertFileToImagePngChatMessage(image);
        console.log(`ai-chat.tsx:${/*LL*/ 41}`, { resp });
      }
    })();
  }, [currentImages]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto" ref={scrollContainer}>
        <AssistantMessage>Hello! How can I help you today?</AssistantMessage>

        {messages.map((x) => {
          const Comp = x.role === "user" ? UserMessage : AssistantMessage;
          return x.content
            .filter((content) => content.type === "text")
            .map((content) => <Comp key={x.id}>{content.text}</Comp>);
        })}
        {mode === "thinking" && <p>Thinking...</p>}
        {mode === "streaming" && <AssistantMessage>{streamedResponse}</AssistantMessage>}
        {mode === "error" && <ErrorMessage />}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setMode("thinking");
          const convertedImages = await Promise.all(
            currentImages.map(convertFileToImagePngChatMessage),
          );
          const newMessages: TChatMessage[] = [
            ...messages,
            {
              id: uuid(),
              role: "user",
              content: [{ type: "text", text: currentInput }, ...convertedImages],
            },
          ];

          console.log(`ai-chat.tsx:${/*LL*/ 78}`, { newMessages });
          const claudeRtn = callClaude({
            messages: newMessages.map((x) => ({ role: x.role, content: x.content })),
            onFirstStream: () => setMode("streaming"),
            onStream: (text) => setStreamedResponse(text),
          });
          setMessages((x: TChatMessage[]) => [
            ...x,
            {
              id: uuid(),
              role: "user",
              content: [{ type: "text", text: currentInput }, ...convertedImages],
            } as TChatMessage,
          ]);
          setCurrentInput("");
          setCurrentImages([]);
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
          }

          const resp = await claudeRtn;
          console.log(`ai-chat.tsx:${/*LL*/ 98}`, { resp });
          if (!resp.success) return setMode("error");

          const newMsg: TChatMessage = {
            id: uuid(),
            role: "assistant",
            content: [{ type: "text", text: resp.data }],
          };

          setMessages((x) => [...x, newMsg]);
          setMode("ready");
        }}
      >
        <AiInputTextAndImages
          disabled={mode === "thinking" || mode === "streaming"}
          text={currentInput}
          onInputText={(text) => setCurrentInput(text)}
          images={currentImages}
          onInputImages={(images) => setCurrentImages(images)}
        />
      </form>
    </div>
  );
};

export default AiChat;
