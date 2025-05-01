import {
  callClaude,
  TChatMessageContentImageSchema as chatMessageContentImageSchema,
  TChatMessage,
  TChatMessageContent,
} from "@/modules/aiChat/anthropicApi";
import { AiInputTextAndImages } from "@/modules/aiChat/components/AiInputTextAndImages";
import {
  AssistantMessage,
  ErrorMessage,
  UserMessageText as UserMessageText,
  UserMessageImage,
} from "@/modules/aiChat/components/Messages";
import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";

const uuid = () => crypto.randomUUID();

const createAssistantMessage = (text: string): TChatMessage => {
  return { id: uuid(), role: "assistant", content: [{ type: "text", text }] };
};

const createUserMessage = (content: TChatMessageContent): TChatMessage => {
  return { id: uuid(), role: "user", content };
};

const convertFileToBase64 = async (file: File) => {
  const resp = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result ?? "") as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return z.string().safeParse(resp.split(";base64,")[1]);
};

const convertFileToFileDetails = async (file: File) => {
  const base64Resp = await convertFileToBase64(file);
  if (!base64Resp.success) return base64Resp;

  const media_type = file.type;
  const type = media_type.split("/")[0];

  return chatMessageContentImageSchema.safeParse({
    type,
    source: { type: "base64", media_type, data: base64Resp.data },
  });
};
const convertFilesToFileDetails = async (files: File[]) => {
  return (await Promise.all(files.map(convertFileToFileDetails)))
    .filter((x) => x.success)
    .map((x) => x.data);
};

const DisplayChatMessages = (p: { messages: TChatMessage[] }) => {
  return (
    <>
      {p.messages.map((x) => {
        if (x.role === "assistant")
          return x.content.map((content, j) => {
            const key = `${x.id}-${j}`;
            console.log(`ai-chat.tsx:${/*LL*/ 78}`, key);
            return (
              <AssistantMessage key={key}>
                {content.type === "text" ? content.text : ""}
              </AssistantMessage>
            );
          });

        const textContent = x.content.filter((x) => x.type === "text");
        const imageContent = x.content.filter((x) => x.type === "image");

        return (
          <React.Fragment key={x.id}>
            {textContent.map((content, j) => {
              const key = `${x.id}-text-${j}`;
              console.log(`ai-chat.tsx:${/*LL*/ 93}`, key);
              return <UserMessageText key={key}>{content.text}</UserMessageText>;
            })}
            <div className="flex items-start gap-2">
              {imageContent.map((content, j) => {
                const key = `${x.id}-image-${j}`;
                console.log(`ai-chat.tsx:${/*LL*/ 93}`, key);
                return <UserMessageImage key={key}>{content.source.data}</UserMessageImage>;
              })}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

const AiChat = () => {
  const [mode, setMode] = useState<"ready" | "thinking" | "streaming" | "error">("ready");
  const [messages, setMessages] = useState<TChatMessage[]>([]);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [currentImages, setCurrentImages] = useState<File[]>([]);
  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollContainer.current) return;
    scrollContainer.current.scrollTop = scrollContainer.current.scrollHeight;
  }, [messages, streamedResponse]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto" ref={scrollContainer}>
        <AssistantMessage>Hello! How can I help you today?</AssistantMessage>

        <DisplayChatMessages messages={messages} />

        {mode === "thinking" && <p>Thinking...</p>}
        {mode === "streaming" && <AssistantMessage>{streamedResponse}</AssistantMessage>}
        {mode === "error" && <ErrorMessage />}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setMode("thinking");

          const newUserMessage = createUserMessage([
            { type: "text", text: currentInput },
            ...(await convertFilesToFileDetails(currentImages)),
          ]);

          const newMessages = [...messages, newUserMessage];

          setMessages(newMessages);
          setCurrentInput("");
          setCurrentImages([]);

          const resp = await callClaude({
            messages: newMessages.map((x) => ({ role: x.role, content: x.content })),
            onFirstStream: () => setMode("streaming"),
            onStream: (text) => setStreamedResponse(text),
          });

          if (!resp.success) return setMode("error");

          setMessages((x) => [...x, createAssistantMessage(resp.data)]);

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
