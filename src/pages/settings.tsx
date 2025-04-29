import { useSettingsStore } from "../stores/settingsStore";

import { Switch } from "@/components/ui/switch";

interface SettingItemProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const SettingItem = ({ title, description, checked, onCheckedChange }: SettingItemProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
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
