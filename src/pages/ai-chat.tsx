import { CustomIcon } from "@/components/CustomIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Anthropic from "@anthropic-ai/sdk";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

const uuid = () => crypto.randomUUID();

const callClaude = async (p: { prompt: string; onStream: (text: string) => void }) => {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    const stream = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1000,
      messages: [{ role: "user", content: p.prompt }],
      stream: true,
    });

    let fullResponse = "";
    for await (const message of stream) {
      if (message.type === "content_block_delta" && "text" in message.delta) {
        fullResponse += message.delta.text;
        p.onStream(fullResponse);
      }
    }

    return { success: true, data: fullResponse } as const;
  } catch (error) {
    return { success: false, error: error } as const;
  }
};

const UserMessage = (p: { children: string }) => {
  return (
    <div className="flex items-start">
      <Card>
        <CardContent className="p-4">
          <p className="text-foreground">{p.children}</p>
        </CardContent>
      </Card>
    </div>
  );
};
const ErrorMessage = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <Card className="/10 w-full max-w-md border-destructive">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
            <CustomIcon iconName="x" size="sm" />
          </div>
          <p className="font-medium">There has been an error processing your request.</p>
        </CardContent>
      </Card>
    </div>
  );
};
const AssistantMessage = (p: { children: string }) => {
  return (
    <div className="react-markdown">
      <Markdown>{p.children}</Markdown>
    </div>
  );
};

type TChatMessage = {
  id: string;
  role: "user" | "bot";
  content: string;
};

const AiChat = () => {
  const [mode, setMode] = useState<"ready" | "thinking" | "streaming" | "error">("ready");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<TChatMessage[]>([]);
  const [streamedResponse, setStreamedResponse] = useState("");
  const scrollContainer = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.metaKey || e.ctrlKey) {
        // Cmd+Enter or Ctrl+Enter - insert new line
        const cursorPosition = e.currentTarget.selectionStart;
        const textBefore = input.substring(0, cursorPosition);
        const textAfter = input.substring(cursorPosition);
        setInput(textBefore + "\n" + textAfter);
        // Move cursor after the newline
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = cursorPosition + 1;
            textareaRef.current.selectionEnd = cursorPosition + 1;
          }
        }, 0);
      } else {
        // Regular Enter - submit form
        e.preventDefault();
        const form = e.currentTarget.form;
        if (form) {
          form.requestSubmit();
        }
      }
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4" ref={scrollContainer}>
        <AssistantMessage>Hello! How can I help you today?</AssistantMessage>

        {messages.map((x) => {
          const Comp = x.role === "user" ? UserMessage : AssistantMessage;
          return <Comp key={x.id}>{x.content}</Comp>;
        })}
        {mode === "thinking" && <p>Thinking...</p>}
        {mode === "streaming" && <AssistantMessage>{streamedResponse}</AssistantMessage>}
        {mode === "error" && <ErrorMessage />}
      </div>

      <Card className="rounded-none border-0">
        <CardContent className="p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setMode("thinking");
              const claudeRtn = callClaude({
                prompt: input,
                onStream: (text) => {
                  setMode("streaming");
                  setStreamedResponse(text);
                },
              });
              setMessages((x) => [...x, { id: uuid(), role: "user", content: input }]);
              setInput("");
              if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
              }

              const resp = await claudeRtn;
              if (resp.success)
                setMessages((x) => [...x, { id: uuid(), role: "bot", content: resp.data }]);
              setMode("ready");
            }}
          >
            <div className="flex items-start space-x-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={1}
                style={{ minHeight: "80px", maxHeight: "200px" }}
              />
              <Button type="submit" disabled={mode === "thinking" || mode === "streaming"}>
                Send
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiChat;
