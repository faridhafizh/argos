import { useState, useEffect } from "react";
import { X, Save, Settings as SettingsIcon } from "lucide-react";

export interface AppSettings {
  apiUrl: string;
  llmModel: string;
  concurrentAgents: number;
  maxSearchDepth: number;
  systemPromptOverride: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [formData, setFormData] = useState<AppSettings>(settings);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'concurrentAgents' || name === 'maxSearchDepth' ? Number(value) : value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-indigo-600">
            <SettingsIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-900">Agent Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          <div>
            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Agent API URL
            </label>
            <input
              type="url"
              id="apiUrl"
              name="apiUrl"
              value={formData.apiUrl}
              onChange={handleChange}
              placeholder="https://api.example.com/v1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="llmModel" className="block text-sm font-medium text-gray-700 mb-1">
              LLM Model
            </label>
            <select
              id="llmModel"
              name="llmModel"
              value={formData.llmModel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="llama-3-70b">Llama 3 70B</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="concurrentAgents" className="block text-sm font-medium text-gray-700 mb-1">
                Concurrent Agents
              </label>
              <input
                type="number"
                id="concurrentAgents"
                name="concurrentAgents"
                min="1"
                max="20"
                value={formData.concurrentAgents}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="maxSearchDepth" className="block text-sm font-medium text-gray-700 mb-1">
                Max Search Depth
              </label>
              <input
                type="number"
                id="maxSearchDepth"
                name="maxSearchDepth"
                min="1"
                max="10"
                value={formData.maxSearchDepth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="systemPromptOverride" className="block text-sm font-medium text-gray-700 mb-1">
              System Prompt Override
            </label>
            <textarea
              id="systemPromptOverride"
              name="systemPromptOverride"
              rows={4}
              value={formData.systemPromptOverride}
              onChange={handleChange}
              placeholder="Enter a custom system prompt to override the default..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
