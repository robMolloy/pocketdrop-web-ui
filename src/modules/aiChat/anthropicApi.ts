import Anthropic from "@anthropic-ai/sdk";

export type TChatMessageContentText = { type: "text"; text: string };
export type TChatMessageContentImage = {
  type: "image";
  source: { type: "base64"; media_type: "image/png"; data: string };
};
export type TChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: (TChatMessageContentText | TChatMessageContentImage)[];
};
export const callClaude = async (p: {
  messages: Omit<TChatMessage, "id">[];
  onFirstStream: () => void;
  onStream: (text: string) => void;
}) => {
  let firstStream = true;
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    const stream = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      // model: "claude-3-7-sonnet-20250219",
      max_tokens: 1000,
      messages: p.messages,
      stream: true,
    });

    let fullResponse = "";
    for await (const message of stream) {
      if (firstStream) {
        p.onFirstStream();
        firstStream = false;
      }
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
