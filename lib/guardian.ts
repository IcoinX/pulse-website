// lib/guardian.ts — Guardian configuration

export const GUARDIAN_ADDRESSES = [
  // Boss wallet (deployer)
  '0xB6EC7BD62De9de95107331dce787FaE0B6A5f5e4'.toLowerCase(),
  // Add more guardians as needed
  // '0x...',
].map(addr => addr.toLowerCase());

export function isGuardian(address: string | null | undefined): boolean {
  if (!address) return false;
  return GUARDIAN_ADDRESSES.includes(address.toLowerCase());
}

export const RESOLUTION_CONFIG = {
  minStake: '0.01',
  protocolFeePercent: 5, // 5%
  reputationDeltaWinner: 50,
  reputationDeltaLoser: -30,
};
