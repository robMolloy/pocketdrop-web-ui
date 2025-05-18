import { CustomIcon } from "@/components/CustomIcon";
import { MainLayout } from "@/components/layout/Layout";
import { OptimisticSwitch } from "@/components/OptimisticSwitch";
import { H1 } from "@/components/ui/defaultComponents";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { pb } from "@/config/pocketbaseConfig";
import { createSetting, updateSetting } from "@/modules/settings/dbSettingsUtils";
import { debounce } from "lodash";
import { useState } from "react";
import { useSettingsStore } from "../modules/settings/settingsStore";
import useAiStore from "@/stores/aiStore";
import { LoadingScreen } from "@/screens/LoadingScreen";

const debouncedUpdate = debounce(
  (p: Parameters<typeof updateSetting>[0]) => updateSetting(p),
  1000,
);
// const debouncedUpdate = debounce((data: TSettingsRecord) => updateSetting({ pb, data }), 1000);

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

const SettingsScreen = () => {
  const settingsStore = useSettingsStore();

  const versionHistorySetting = settingsStore.data?.find((x) => x.settingName === "versionHistory");
  const encryptFilesSetting = settingsStore.data?.find((x) => x.settingName === "encryptFiles");
  const aiChatSetting = settingsStore.data?.find((x) => x.settingName === "aiChat");

  const aiStore = useAiStore();

  const [aiChatSettingValue, setAiChatSettingValue] = useState(aiChatSetting?.value ?? "");
  // const [updateStatus, setUpdateStatus] = useState<"idle" | "success" | "error">("idle");

  return (
    <>
      <H1>Settings</H1>

      <br />

      <div>
        <SettingItem
          title="Use AI Chat"
          description="Allow AI chat and index your files with suitable keywords to allow smart search"
        >
          <div className="flex flex-col items-end justify-end gap-2">
            <OptimisticSwitch
              checked={aiChatSetting?.isEnabled ?? false}
              onCheckedChange={(isEnabled) => {
                const newValueObj = isEnabled ? {} : { value: "" };
                if (aiChatSetting)
                  return updateSetting({
                    pb,
                    data: { ...aiChatSetting, isEnabled, ...newValueObj },
                  });

                return createSetting({
                  pb,
                  data: { settingName: "aiChat", isEnabled, ...newValueObj },
                });
              }}
            />

            <div className="flex items-center gap-2">
              <Input
                disabled={!aiChatSetting?.isEnabled}
                value={aiChatSettingValue}
                onChange={async (e) => {
                  setAiChatSettingValue(e.target.value);
                  if (!aiChatSetting) return;

                  await debouncedUpdate({
                    pb,
                    data: { ...aiChatSetting, value: e.target.value },
                  });
                }}
              />
              {aiStore.data && <CustomIcon iconName="check" className="text-success" size="sm" />}
              {!aiStore.data && <CustomIcon iconName="x" className="text-destructive" size="sm" />}
            </div>
          </div>
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
      <pre>{JSON.stringify(settingsStore.data, null, 2)}</pre>
    </>
  );
};

const SettingsPage = () => {
  const settingsStore = useSettingsStore();

  return (
    <MainLayout>
      {settingsStore.data === undefined && <>loading...</>}
      {settingsStore.data !== undefined && <SettingsScreen />}
    </MainLayout>
  );
};

export default SettingsPage;
