'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SimpleHome() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          setError(error.message);
        } else {
          setEvents(data || []);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">PULSE Protocol</h1>
      
      <div className="mb-6">
        <a 
          href="https://pulseprotocol.co/dashboard" 
          className="inline-block px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700"
        >
          Connect Wallet →
        </a>
      </div>

      <h2 className="text-xl font-semibold mb-4">Events ({events.length})</h2>
      
      {events.length === 0 ? (
        <p className="text-gray-500">No events found in database.</p>
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
                <span className="px-2 py-1 bg-gray-800 rounded">
                  #{event.event_id}
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded">
                  {event.source_type}
                </span>
                <span className={`px-2 py-1 rounded ${
                  event.status === 'VERIFIED' ? 'bg-green-900 text-green-400' :
                  event.status === 'CHALLENGED' ? 'bg-red-900 text-red-400' :
                  'bg-yellow-900 text-yellow-400'
                }`}>
                  {event.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
