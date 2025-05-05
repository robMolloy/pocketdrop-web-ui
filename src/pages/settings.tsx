import { OptimisticSwitch } from "@/components/OptimisticSwitch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { pb } from "@/config/pocketbaseConfig";
import { createSetting, updateSetting } from "@/modules/settings/dbSettingsUtils";
import { useSettingsStore } from "../modules/settings/settingsStore";
import { MainLayout } from "@/components/layout/Layout";
import { H1 } from "@/components/ui/defaultComponents";

export const SettingItem = (p: {
  title: string;
  description: string;
  disabledTooltip?: string;
  children?: React.ReactNode;
}) => {
  const content = (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg">{p.title}</h2>
        <p className="text-sm text-gray-500">{p.description}</p>
      </div>
      {p.children}
    </div>
  );

  if (!!p.disabledTooltip) {
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
  const settingsStore = useSettingsStore();

  const versionHistorySetting = settingsStore.data?.find((x) => x.settingName === "versionHistory");
  const encryptFilesSetting = settingsStore.data?.find((x) => x.settingName === "encryptFiles");
  const aiChatSetting = settingsStore.data?.find((x) => x.settingName === "aiChat");

  return (
    <MainLayout>
      <H1>Settings</H1>

      <br />

      <div>
        <SettingItem
          title="Use AI Chat"
          description="Allow AI chat and index your files with suitable keywords to allow smart search"
        >
          <OptimisticSwitch
            checked={aiChatSetting?.isEnabled ?? false}
            onCheckedChange={(isEnabled) => {
              if (aiChatSetting)
                return updateSetting({ pb, data: { ...aiChatSetting, isEnabled } });

              return createSetting({ pb, data: { settingName: "aiChat", isEnabled } });
            }}
          />
        </SettingItem>
        <HorizontalSpacer />
        <SettingItem
          title="Store Version History"
          description="Keep track of file changes and maintain version history"
        >
          <OptimisticSwitch
            checked={versionHistorySetting?.isEnabled ?? false}
            onCheckedChange={(isEnabled) => {
              if (versionHistorySetting)
                return updateSetting({ pb, data: { ...versionHistorySetting, isEnabled } });

              return createSetting({ pb, data: { settingName: "versionHistory", isEnabled } });
            }}
          />
        </SettingItem>

        <HorizontalSpacer />

        <SettingItem
          title="Encrypt Files"
          description="Enable client-side encryption for stored files"
          disabledTooltip="File encryption is not yet implemented"
        >
          <OptimisticSwitch
            checked={encryptFilesSetting?.isEnabled ?? false}
            disabled={true}
            onCheckedChange={(isEnabled) => {
              if (encryptFilesSetting)
                return updateSetting({ pb, data: { ...encryptFilesSetting, isEnabled } });

              return createSetting({ pb, data: { settingName: "versionHistory", isEnabled } });
            }}
          />
        </SettingItem>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
