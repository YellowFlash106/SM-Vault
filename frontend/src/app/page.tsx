// frontend/src/app/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/vault');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Lock className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">SP Vault</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}