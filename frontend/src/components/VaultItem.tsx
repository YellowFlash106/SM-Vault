 // frontend/src/components/VaultItem.tsx

'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Edit2, Trash2, ExternalLink, Check } from 'lucide-react';
import { VaultItem } from '@/lib/crypto';

interface VaultItemProps {
  item: VaultItem & { id: string };
  onEdit: () => void;
  onDelete: () => void;
}

export default function VaultItemComponent({ item, onEdit, onDelete }: VaultItemProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.password).then(() => {
      setCopied(true);
      
      // Auto-clear clipboard after 15 seconds
      setTimeout(() => {
        navigator.clipboard.writeText('').catch(() => {
          // Ignore clipboard clear errors
        });
      }, 15000);
    }).catch((err) => {
      console.error('Failed to copy to clipboard', err);
      alert('Unable to copy to clipboard');
    });
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 15000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
          {item.username && (
            <p className="text-sm text-gray-600 mb-1">{item.username}</p>
          )}
          {item.url && (
            <a
              href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
            >
              {item.url}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-indigo-600 hover:text-indigo-700 p-2 hover:bg-indigo-50 rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg mb-3">
        <code className="flex-1 text-sm font-mono text-gray-800">
          {showPassword ? item.password : '••••••••••••'}
        </code>
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-200 rounded transition-colors"
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button
          onClick={handleCopy}
          className={`p-1 rounded transition-colors ${
            copied 
              ? 'text-green-600 hover:bg-green-50' 
              : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
          }`}
          title={copied ? 'Copied! Will clear in 15s' : 'Copy password'}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {item.notes && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.notes}</p>
        </div>
      )}
    </div>
  );
}