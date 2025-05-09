import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const chatMessageContentTextSchema = z.object({ type: z.literal("text"), text: z.string() });
export const chatMessageContentImageSchema = z.object({
  type: z.literal("image"),
  source: z.object({
    type: z.literal("base64"),
    media_type: z.enum(["image/png", "image/jpeg", "image/webp", "image/gif"]),
    data: z.string(),
  }),
});
export const chatMessageContentDocSchema = z.object({
  type: z.literal("document"),
  source: z.object({
    type: z.literal("base64"),
    media_type: z.enum(["application/pdf"]),
    data: z.string(),
  }),
});

export const chatMessageContentSchema = z.union([
  chatMessageContentTextSchema,
  chatMessageContentImageSchema,
  chatMessageContentDocSchema,
]);
export type TChatMessageContent = z.infer<typeof chatMessageContentSchema>[];
export type TChatMessage = { id: string; role: "user" | "assistant"; content: TChatMessageContent };

const uuid = () => crypto.randomUUID();

export const createAssistantMessage = (text: string): TChatMessage => {
  return { id: uuid(), role: "assistant", content: [{ type: "text", text }] };
};

export const createUserMessage = (content: TChatMessageContent): TChatMessage => {
  return { id: uuid(), role: "user", content };
};

export const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const callClaude = async (p: {
  messages: Omit<TChatMessage, "id">[];
  onFirstStream: () => void;
  onStream: (text: string) => void;
}) => {
  let firstStream = true;
  try {
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
