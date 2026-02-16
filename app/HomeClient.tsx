'use client';

import { useState } from 'react';

interface Event {
  event_id: number;
  title: string;
  source_type: string;
  status: string;
}

interface HomeClientProps {
  events: Event[];
  error: string | null;
}

export default function HomeClient({ events, error }: HomeClientProps) {
  const [debug] = useState('BUILD_FINGERPRINT: 2026-02-16_2340Z_FINAL_v2');

  if (error) return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">PULSE Protocol</h1>
      <div className="p-4 bg-red-900 rounded">Error: {error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">PULSE Protocol</h1>
      
      <div className="mb-6 p-4 bg-purple-900 rounded">
        <p className="text-sm font-mono">{debug}</p>
        <p className="text-xs text-gray-400">Server Component + Client Component</p>
      </div>

      <h2 className="text-xl font-semibold mb-4">Events ({events.length})</h2>
      
      {events.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.event_id} className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {event.source_type === 'AGENT' ? '🤖' : 
                   event.source_type === 'ONCHAIN' ? '⛓️' : '📰'}
                </span>
                <h3 className="text-lg font-medium">{event.title}</h3>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="px-2 py-1 bg-gray-800 rounded">#{event.event_id}</span>
                <span className="px-2 py-1 bg-gray-800 rounded">{event.source_type}</span>
                <span className="px-2 py-1 bg-yellow-900 text-yellow-400 rounded">{event.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
