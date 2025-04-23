import React from "react";
import { Spinner } from "@/components/ui/spinner";

interface PageLoadingProps {
    text?: string;
}

export function PageLoading({ text = "Loading..." }: PageLoadingProps) {
    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
            <Spinner size="lg" />
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
    );
} 