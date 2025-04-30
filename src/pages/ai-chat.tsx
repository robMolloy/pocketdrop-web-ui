import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Anthropic from "@anthropic-ai/sdk";
import { useEffect, useRef, useState } from "react";

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
const AssistantMessage = (p: { children: string }) => {
  return <p className="whitespace-pre-wrap">{p.children}</p>;
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

  useEffect(() => {
    if (!scrollContainer.current) return;
    scrollContainer.current.scrollTop = scrollContainer.current.scrollHeight;
  }, [messages]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4" ref={scrollContainer}>
        <AssistantMessage>Hello! How can I help you today?</AssistantMessage>

        {messages.map((x) => {
          const Comp = x.role === "user" ? UserMessage : AssistantMessage;
          return <Comp key={x.id}>{x.content}</Comp>;
        })}
        {mode === "thinking" && <p>Thinking...</p>}
        {mode === "streaming" && <p>{streamedResponse}</p>}
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

              const resp = await claudeRtn;
              if (resp.success)
                setMessages((x) => [...x, { id: uuid(), role: "bot", content: resp.data }]);
              setMode("ready");
            }}
          >
            <div className="flex items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" disabled={mode === "thinking"}>
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
