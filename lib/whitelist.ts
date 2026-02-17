// Whitelist temporaire pour Boost (phase testnet)
export const BOOST_WHITELIST = [
  // Boss wallets
  '0xB6EC7BD62De9de95107331dce787FaE0B6A5f5e4'.toLowerCase(),
  // Add more as needed
  // '0x...',
].map(addr => addr.toLowerCase());

export function isWhitelisted(address: string | null | undefined): boolean {
  if (!address) return false;
  return BOOST_WHITELIST.includes(address.toLowerCase());
}

export const WHITELIST_MESSAGE = {
  title: 'Boost in Limited Test',
  description: 'Access expanding soon. Contact us for early access.',
  cta: 'Request Access'
};
