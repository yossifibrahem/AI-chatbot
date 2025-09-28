import React, { useState, useEffect } from 'react';
import { X, Settings, Server, Key, Brain, Save, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiConfig {
  base: string;
  key: string;
  model: string;
}

const DEFAULT_CONFIG: ApiConfig = {
  base: 'http://localhost:4321',
  key: 'none',
  model: 'gpt-4o-mini'
};

const POPULAR_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'claude-3-5-sonnet-20241022',
  'claude-3-haiku-20240307',
  'llama-3.1-70b-versatile',
  'mixtral-8x7b-32768'
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [config, setConfig] = useState<ApiConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load current config
      try {
        const base = localStorage.getItem('apiBase') || DEFAULT_CONFIG.base;
        const key = localStorage.getItem('apiKey') || DEFAULT_CONFIG.key;
        const model = localStorage.getItem('apiModel') || DEFAULT_CONFIG.model;
        setConfig({ base, key, model });
      } catch (e) {
        setConfig(DEFAULT_CONFIG);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    try {
      localStorage.setItem('apiBase', config.base);
      localStorage.setItem('apiKey', config.key);
      localStorage.setItem('apiModel', config.model);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Settings size={18} className="text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-100">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Server size={16} />
                API Base URL
              </label>
              <input
                type="text"
                value={config.base}
                onChange={(e) => setConfig(prev => ({ ...prev, base: e.target.value }))}
                placeholder="http://localhost:4321"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Key size={16} />
                API Key
              </label>
              <input
                type="password"
                value={config.key}
                onChange={(e) => setConfig(prev => ({ ...prev, key: e.target.value }))}
                placeholder="Enter your API key"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Brain size={16} />
                Model
              </label>
              <select
                value={config.model}
                onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {POPULAR_MODELS.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              Reset
            </button>
            <button
              onClick={handleSave}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white'
              )}
            >
              <Save size={16} />
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}