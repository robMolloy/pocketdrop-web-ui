import { CustomIcon } from "@/components/CustomIcon";
import { Button } from "@/components/ui/button";
import { callClaude, TChatMessage } from "@/modules/aiChat/anthropicApi";
import { AssistantMessage, ErrorMessage, UserMessage } from "@/modules/aiChat/components/Messages";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

const uuid = () => crypto.randomUUID();

const AiChat = () => {
  const [mode, setMode] = useState<"ready" | "thinking" | "streaming" | "error">("ready");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<TChatMessage[]>([]);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const scrollContainer = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
    onDrop: (acceptedFiles) => setImages((prev) => [...prev, ...acceptedFiles]),
    noClick: true,
  });

  useEffect(() => {
    if (!scrollContainer.current) return;
    scrollContainer.current.scrollTop = scrollContainer.current.scrollHeight;
  }, [messages, streamedResponse]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.key === "Enter" && !e.shiftKey)) return;
    if (e.metaKey || e.ctrlKey) {
      const cursorPosition = e.currentTarget.selectionStart;
      const textBefore = input.substring(0, cursorPosition);
      const textAfter = input.substring(cursorPosition);
      setInput(textBefore + "\n" + textAfter);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = cursorPosition + 1;
          textareaRef.current.selectionEnd = cursorPosition + 1;
        }
      }, 0);
      return;
    }

    // Regular Enter - submit form
    e.preventDefault();
    const form = e.currentTarget.form;
    if (form) form.requestSubmit();
  };

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
          const newMessages = [...messages, { role: "user", content: input }] as TChatMessage[];
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
              content: [
                { type: "text", text: input },
                ...images.map((x) => {
                  return {
                    type: "image",
                    source: { type: "base64", media_type: "image/png", data: x.name },
                  };
                }),
              ],
            } as TChatMessage,
          ]);
          setInput("");
          setImages([]);
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
          }

          const resp = await claudeRtn;
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
        <div className="flex items-start">
          <div className="relative flex-1" {...getRootProps()}>
            <input {...getInputProps()} />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={isDragActive ? "Drop images here..." : "Type your message..."}
              className={`w-full resize-none rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isDragActive ? "border-primary" : ""}`}
              rows={1}
              style={{ minHeight: "80px", maxHeight: "200px" }}
            />
            <Button
              type="submit"
              disabled={mode === "thinking" || mode === "streaming"}
              className="absolute bottom-3 right-1 h-8 w-8 p-0"
            >
              <CustomIcon iconName="upload" size="sm" />
            </Button>
          </div>
        </div>
        {images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-2">
            {images.map((file, index) => (
              <div key={index} className="relative h-20 w-20 flex-shrink-0">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                  className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                >
                  <CustomIcon iconName="x" size="xs" />
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default AiChat;
