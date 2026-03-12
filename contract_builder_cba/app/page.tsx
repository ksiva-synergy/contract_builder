'use client';

import { useState } from 'react';
import ContractForm from '@/components/ContractForm';
import ContractPreview from '@/components/ContractPreview';
import CanvasEditor from '@/components/CanvasEditor';
import { createEmptyContract } from '@/lib/contract-utils';

export default function Home() {
  const [contract, setContract] = useState(createEmptyContract());
  const [view, setView] = useState<'canvas' | 'form' | 'preview'>('canvas');

  return (
    <main className={view === 'canvas' ? 'h-screen' : 'min-h-screen bg-gray-50 py-8'}>
      {view !== 'canvas' && (
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Digital Contract Builder</h1>
          
          {/* View Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setView('canvas')}
              className={`px-6 py-2 rounded ${
                view === 'canvas' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Canvas Editor
            </button>
            <button
              onClick={() => setView('form')}
              className={`px-6 py-2 rounded ${
                view === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Form Editor
            </button>
            <button
              onClick={() => setView('preview')}
              className={`px-6 py-2 rounded ${
                view === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Preview Contract
            </button>
          </div>

          {/* Content */}
          {view === 'form' ? (
            <ContractForm contract={contract} onChange={setContract} />
          ) : (
            <ContractPreview contract={contract} />
          )}
        </div>
      )}

      {view === 'canvas' && (
        <CanvasEditor contract={contract} onChange={setContract} />
      )}
    </main>
  );
}
