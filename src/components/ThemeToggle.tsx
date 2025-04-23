import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/stores/themeStore";

export function ThemeToggle() {
  const themeStore = useThemeStore();
  const theme = themeStore.data;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={themeStore.cycleTheme}
      title={(() => {
        return theme === "light" ? "Light mode" : theme === "dark" ? "Dark mode" : "System theme";
      })()}
    >
      {(() => {
        const Comp = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
        return <Comp className="h-[1.2rem] w-[1.2rem]" />;
      })()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
