import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const AiChat = () => {
  const [input, setInput] = useState("");

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex items-start space-x-2">
          <Card>
            <CardContent className="p-4">
              <p className="text-foreground">Hello! How can I help you today?</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Message */}
        <p>This is a sample user message</p>
      </div>

      {/* Input Area */}
      <Card className="rounded-none border-0">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button>Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiChat;
