import { useSettingsStore } from "../stores/settingsStore";
import { Switch } from "@/components/ui/switch";

const SettingsPage = () => {
  const { storeVersionHistory, encryptFiles, setStoreVersionHistory, setEncryptFiles } =
    useSettingsStore();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg">Store Version History</h2>
            <p className="text-sm text-gray-500">
              Keep track of file changes and maintain version history
            </p>
          </div>
          <Switch checked={storeVersionHistory} onCheckedChange={setStoreVersionHistory} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg">Encrypt Files</h2>
            <p className="text-sm text-gray-500">Enable encryption for stored files</p>
          </div>
          <Switch checked={encryptFiles} onCheckedChange={setEncryptFiles} />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
