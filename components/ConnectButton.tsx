'use client';

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';

export default function ConnectButton() {
  return (
    <RainbowConnectButton 
      accountStatus="address"
      chainStatus="icon"
      showBalance={false}
    />
  );
}
