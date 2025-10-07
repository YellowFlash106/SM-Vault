// frontend/src/components/PasswordGenerator.tsx

'use client';

import { useState } from 'react';
import { generateSecurePassword, PasswordOptions } from '@/lib/crypto';
import { RefreshCw, Copy, Check, X } from 'lucide-react';

interface PasswordGeneratorProps {
  onClose: () => void;
  onUsePassword: (password: string) => void;
}

export default function PasswordGenerator({ onClose, onUsePassword }: PasswordGeneratorProps) {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: true
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const password = generateSecurePassword({ ...options, length });
    setGeneratedPassword(password);
    setCopied(false);
  };

  const handleCopy = () => {
    // Write password to clipboard and schedule an auto-clear
    navigator.clipboard.writeText(generatedPassword).then(() => {
      setCopied(true);
      // Clear clipboard after 12 seconds (within 10-20s requirement)
      setTimeout(() => {
        // Overwrite clipboard with empty string to clear
        navigator.clipboard.writeText('')
          .catch(() => {
            /* ignore clipboard clear errors */
          });
      }, 12000);

      // Keep the "copied" UI state for the same duration
      setTimeout(() => setCopied(false), 12000);
    }).catch((err) => {
      console.error('Failed to copy to clipboard', err);
      alert('Unable to copy to clipboard');
    });
  };

  const handleUse = () => {
    onUsePassword(generatedPassword);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Password Generator</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Length: {length}
          </label>
        </div>
        <input
          type="range"
          min="8"
          max="32"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeNumbers}
            onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Numbers</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeSymbols}
            onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Symbols</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.excludeAmbiguous}
            onChange={(e) => setOptions({ ...options, excludeAmbiguous: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Exclude Ambiguous</span>
        </label>
      </div>

      <button
        onClick={handleGenerate}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors mb-4"
      >
        <RefreshCw className="w-4 h-4" />
        Generate
      </button>

      {generatedPassword && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <code className="flex-1 text-lg font-mono break-all text-gray-800">
              {generatedPassword}
            </code>
            <button
              onClick={handleCopy}
              className="text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <button
            onClick={handleUse}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Use This Password
          </button>
        </div>
      )}
    </div>
  );
}