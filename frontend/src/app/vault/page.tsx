// frontend/src/app/vault/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { vaultAPI } from '@/lib/api';
import { encryptVaultItem, decryptVaultItem, VaultItem } from '@/lib/crypto';
import Navbar from '@/components/Navbar';
import PasswordGenerator from '@/components/PasswordGenerator';
import VaultItemComponent from '@/components/VaultItem';
import AddItemModal from '@/components/AddItemModal';
import { Plus, Search, Key, Unlock } from 'lucide-react';

interface VaultItemWithId extends VaultItem {
  id: string;
}

export default function VaultPage() {
  const { user, masterPassword, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [vaultItems, setVaultItems] = useState<VaultItemWithId[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItemWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && masterPassword) {
      fetchVaultItems();
    }
  }, [user, masterPassword]);

  const fetchVaultItems = async () => {
    try {
      setIsLoading(true);
      const response = await vaultAPI.getAll();
      
      const decryptedItems = await Promise.all(
        response.data.items.map(async (item) => {
          try {
            const decrypted = await decryptVaultItem(item.encryptedData, masterPassword!);
            return {
              ...decrypted,
              id: item._id
            };
          } catch (error) {
            console.error('Failed to decrypt item:', error);
            return null;
          }
        })
      );

      setVaultItems(decryptedItems.filter((item): item is VaultItemWithId => item !== null));
    } catch (error) {
      console.error('Failed to fetch vault items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (item: VaultItem) => {
    try {
      const encrypted = await encryptVaultItem(item, masterPassword!);
      await vaultAPI.create({ encryptedData: encrypted });
      await fetchVaultItems();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item');
    }
  };

  const handleUpdateItem = async (item: VaultItem) => {
    if (!editingItem) return;
    
    try {
      const encrypted = await encryptVaultItem(item, masterPassword!);
      await vaultAPI.update(editingItem.id, { encryptedData: encrypted });
      await fetchVaultItems();
      setEditingItem(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await vaultAPI.delete(id);
      await fetchVaultItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item');
    }
  };

  const handleEdit = (item: VaultItemWithId) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const filteredItems = vaultItems.filter((item) => {
    const search = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(search) ||
      item.username.toLowerCase().includes(search) ||
      item.url.toLowerCase().includes(search)
    );
  });

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex gap-4 flex-wrap items-center">
          <button
            onClick={() => {
              setShowGenerator(!showGenerator);
              setShowAddModal(false);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Key className="w-4 h-4" />
            Generate Password
          </button>

          <button
            onClick={() => {
              setShowAddModal(true);
              setShowGenerator(false);
              setEditingItem(null);
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>

          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vault..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {showGenerator && (
          <PasswordGenerator
            onClose={() => setShowGenerator(false)}
            onUsePassword={(password) => {
              setEditingItem({ id: '', title: '', username: '', password, url: '', notes: '' } as VaultItemWithId);
              setShowAddModal(true);
              setShowGenerator(false);
            }}
          />
        )}

        {showAddModal && (
          <AddItemModal
            item={editingItem || undefined}
            isEditing={editingItem !== null && editingItem.id !== ''}
            onSave={editingItem && editingItem.id !== '' ? handleUpdateItem : handleAddItem}
            onClose={() => {
              setShowAddModal(false);
              setEditingItem(null);
            }}
          />
        )}

        <div className="grid gap-4">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500">Loading your vault...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Unlock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? 'No items found matching your search' : 'No items in your vault yet. Add one to get started!'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <VaultItemComponent
                key={item.id}
                item={item}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}