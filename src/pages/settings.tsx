import { useSettingsStore } from "../stores/settingsStore";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const SettingItem = (p: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  disabledTooltip?: string;
}) => {
  const content = (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg">{p.title}</h2>
        <p className="text-sm text-gray-500">{p.description}</p>
      </div>
      <Switch checked={p.checked} onCheckedChange={p.onCheckedChange} disabled={p.disabled} />
    </div>
  );

  if (p.disabled && p.disabledTooltip) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-not-allowed opacity-50">{content}</div>
          </TooltipTrigger>
          <TooltipContent sideOffset={-30}>
            <p>{p.disabledTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

const HorizontalSpacer = () => {
  return <div className="my-4 h-px bg-secondary" />;
};

const SettingsPage = () => {
  const { storeVersionHistory, encryptFiles, setStoreVersionHistory, setEncryptFiles } =
    useSettingsStore();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <div className="space-y-4">
        <SettingItem
          title="Store Version History"
          description="Keep track of file changes and maintain version history"
          checked={storeVersionHistory}
          onCheckedChange={setStoreVersionHistory}
        />
        <HorizontalSpacer />
        <SettingItem
          title="Encrypt Files"
          description="Enable encryption for stored files"
          checked={encryptFiles}
          onCheckedChange={setEncryptFiles}
          disabled={true}
          disabledTooltip="File encryption is not yet implemented"
        />
      </div>
    </div>
  );
};

export default SettingsPage;
