import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";

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
  const scrollToBottom = () => {
    if (!scrollContainer.current) return;

    scrollContainer.current.scrollTop = scrollContainer.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4" ref={scrollContainer}>
        <div className="flex items-start">
          <UserMessage>Hello! How can I help you today?</UserMessage>
        </div>

        {/* AI Message */}
        <p>This is a sample user message</p>

        {messages.map((x) => (
          <UserMessage key={x}>{x}</UserMessage>
        ))}
      </div>

      {/* Input Area */}
      <Card className="rounded-none border-0">
        <CardContent className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
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
