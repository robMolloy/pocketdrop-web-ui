import { CustomIcon } from "@/components/CustomIcon";
import { Card, CardContent } from "@/components/ui/card";
import Markdown from "react-markdown";

export const AssistantMessage = (p: { children: string }) => {
  return (
    <div className="react-markdown">
      <Markdown>{p.children}</Markdown>
    </div>
  );
};

export const UserMessage = (p: { children: string }) => {
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
export const ErrorMessage = () => {
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
