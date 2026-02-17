'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AuthToastListener() {
  useEffect(() => {
    const handleConnected = () => {
      toast.success("Welcome to PULSE — you're now an active participant.", {
        duration: 4000,
        icon: '👤',
      });
    };

    const handleDisconnected = () => {
      toast('Disconnected from PULSE', {
        icon: '👋',
      });
    };

    window.addEventListener('pulse:connected', handleConnected);
    window.addEventListener('pulse:disconnected', handleDisconnected);

    return () => {
      window.removeEventListener('pulse:connected', handleConnected);
      window.removeEventListener('pulse:disconnected', handleDisconnected);
    };
  }, []);

  return null;
}
