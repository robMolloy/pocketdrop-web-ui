import { useSettingsStore } from "../stores/settingsStore";

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
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={storeVersionHistory}
              onChange={(e) => setStoreVersionHistory(e.target.checked)}
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg">Encrypt Files</h2>
            <p className="text-sm text-gray-500">Enable encryption for stored files</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={encryptFiles}
              onChange={(e) => setEncryptFiles(e.target.checked)}
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
