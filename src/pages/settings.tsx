import { useSettingsStore } from "../stores/settingsStore";

import { Switch } from "@/components/ui/switch";

export const SettingItem = (p: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg">{p.title}</h2>
        <p className="text-sm text-gray-500">{p.description}</p>
      </div>
      <Switch checked={p.checked} onCheckedChange={p.onCheckedChange} />
    </div>
  );
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
        />
      </div>
    </div>
  );
};

export default SettingsPage;
