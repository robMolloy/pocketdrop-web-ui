import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Anthropic from "@anthropic-ai/sdk";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
const callClaude = async (prompt: string) => {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });
    const schema = z.object({
      content: z.tuple([z.object({ text: z.string() })]),
    });

    const parsed = schema.safeParse(response);

    if (!parsed.success) return parsed;
    return {
      success: true,
      data: parsed.data.content[0].text,
    } as const;
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

const AiChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollContainer.current) return;
    scrollContainer.current.scrollTop = scrollContainer.current.scrollHeight;
  }, [messages]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4" ref={scrollContainer}>
        <UserMessage>Hello! How can I help you today?</UserMessage>

        {/* AI Message */}
        <p className="whitespace-pre-wrap">{`This is a sample user message
asd`}</p>

        {messages.map((x) => (
          <UserMessage key={x}>{x}</UserMessage>
        ))}
      </div>

      {/* Input Area */}
      <Card className="rounded-none border-0">
        <CardContent className="p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const resp = await callClaude(input);
              console.log(`ai-chat.tsx:${/*LL*/ 85}`, { resp });
              setMessages([...messages, input]);
              setInput("");
            }}
          >
            <div className="flex items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit">Send</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiChat;
