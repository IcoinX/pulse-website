import { ethers } from 'ethers';
import { CONTRACTS } from './wallet';

// ABIs minimaux (extraits des contrats déployés)
export const REGISTRY_ABI = [
  "function registerEvent(bytes32 canonicalHash) returns (uint256 eventId)",
  "function getEvent(uint256 eventId) view returns (bytes32 canonicalHash, address creator, uint64 createdAt, bool exists)",
  "function eventCount() view returns (uint256)",
  "event EventRegistered(uint256 indexed eventId, bytes32 canonicalHash, address indexed creator, uint64 createdAt)"
];

export const BOOSTS_ABI = [
  // Read
  "function tierPrices(uint8 tier) view returns (uint256)",
  "function getBoostStatus(uint256 eventId) view returns (bool isBoosted, uint256 endTime, uint8 tier, address booster)",
  "function eventBoosts(uint256 eventId, uint256 index) view returns (address booster, uint256 amount, uint256 startTime, uint256 endTime, uint8 tier, bool active)",
  // Write
  "function boost(uint256 eventId, uint8 tier) payable",
  // Events
  "event Boosted(uint256 indexed eventId, address indexed booster, uint256 amount, uint256 startTime, uint256 endTime, uint8 tier)"
];

// Boost tiers configuration
export const BOOST_TIERS = {
  0: { name: '24h', duration: 24 * 60 * 60, price: '0.001' },
  1: { name: '72h', duration: 3 * 24 * 60 * 60, price: '0.002' },
  2: { name: '7d', duration: 7 * 24 * 60 * 60, price: '0.005' }
};

export interface BoostParams {
  eventId: number;
  tier: 0 | 1 | 2;
  value: string; // in ETH
}

export const ASSERTIONS_ABI = [
  "function createAssertion(uint256 eventId, uint8 assertionType, bytes32 claimHash) payable returns (uint256 assertionId)",
  "function challengeAssertion(uint256 assertionId, bytes32 counterHash) payable returns (uint256 challengeId)",
  "function resolve(uint256 assertionId, uint8 outcome)",
  "function getAssertion(uint256 assertionId) view returns (uint256 eventId, address asserter, uint8 assertionType, bytes32 claimHash, uint256 stakeAmount, uint256 challengeDeadline, uint8 status)",
  "function getChallenge(uint256 challengeId) view returns (uint256 assertionId, address challenger, uint256 stakeAmount, bytes32 counterHash, bool resolved)",
  "event AssertionCreated(uint256 indexed assertionId, uint256 indexed eventId, address indexed asserter, uint8 assertionType, bytes32 claimHash, uint256 stakeAmount, uint256 challengeDeadline)",
  "event AssertionChallenged(uint256 indexed assertionId, uint256 indexed challengeId, address indexed challenger, uint256 stakeAmount, bytes32 counterHash)",
  "event AssertionResolved(uint256 indexed assertionId, uint8 outcome, address indexed slashedParty, uint256 rewardAmount)"
];

// Contract types
export enum AssertionType {
  AGENT = 0,
  HUMAN = 1
}

export enum AssertionStatus {
  PENDING = 0,
  CHALLENGED = 1,
  RESOLVED = 2
}

export enum ResolutionOutcome {
  ASSERTER_WINS = 0,
  CHALLENGER_WINS = 1
}

// Write functions
export async function boostEvent(
  params: BoostParams,
  signer: ethers.Signer
): Promise<ethers.ContractTransaction> {
  const contractAddress = CONTRACTS[84532]?.boosts;
  if (!contractAddress) {
    throw new Error('No boosts contract for Base Sepolia');
  }
  
  const contract = new ethers.Contract(contractAddress, BOOSTS_ABI, signer);
  const valueWei = ethers.utils.parseEther(params.value);
  
  const tx = await contract.boost(params.eventId, params.tier, { value: valueWei });
  return tx;
}

// Legacy boost function (keeping for backwards compatibility)
export async function boostEventLegacy(
  eventId: number, 
  tier: number, 
  value: string, 
  signer: ethers.Signer,
  chainId: number = 84532
) {
  const contractAddress = CONTRACTS[chainId as keyof typeof CONTRACTS]?.boosts;
  if (!contractAddress) {
    throw new Error(`No boosts contract for chain ${chainId}`);
  }
  
  const contract = new ethers.Contract(contractAddress, BOOSTS_ABI, signer);
  const tx = await contract.boost(eventId, tier, { value: ethers.utils.parseEther(value) });
  return tx.wait();
}

export async function createAssertion(
  eventId: number, 
  type: number, 
  claimHash: string, 
  stake: string, 
  signer: ethers.Signer,
  chainId: number = 84532
) {
  const contractAddress = CONTRACTS[chainId as keyof typeof CONTRACTS]?.assertions;
  if (!contractAddress) {
    throw new Error(`No assertions contract for chain ${chainId}`);
  }
  
  const contract = new ethers.Contract(contractAddress, ASSERTIONS_ABI, signer);
  const tx = await contract.createAssertion(eventId, type, claimHash, { value: ethers.utils.parseEther(stake) });
  return tx.wait();
}

export async function challengeAssertion(
  assertionId: number, 
  counterHash: string, 
  stake: string, 
  signer: ethers.Signer,
  chainId: number = 84532
) {
  const contractAddress = CONTRACTS[chainId as keyof typeof CONTRACTS]?.assertions;
  if (!contractAddress) {
    throw new Error(`No assertions contract for chain ${chainId}`);
  }
  
  const contract = new ethers.Contract(contractAddress, ASSERTIONS_ABI, signer);
  const tx = await contract.challengeAssertion(assertionId, counterHash, { value: ethers.utils.parseEther(stake) });
  return tx.wait();
}

export async function resolveAssertion(
  assertionId: number,
  outcome: number,
  signer: ethers.Signer,
  chainId: number = 84532
) {
  const contractAddress = CONTRACTS[chainId as keyof typeof CONTRACTS]?.assertions;
  if (!contractAddress) {
    throw new Error(`No assertions contract for chain ${chainId}`);
  }
  
  const contract = new ethers.Contract(contractAddress, ASSERTIONS_ABI, signer);
  const tx = await contract.resolve(assertionId, outcome);
  return tx.wait();
}

// Read functions
export async function getTierPrice(tier: number, provider: ethers.providers.Provider, chainId: number = 84532): Promise<string> {
  const contractAddress = CONTRACTS[chainId as keyof typeof CONTRACTS]?.boosts;
  if (!contractAddress) {
    throw new Error(`No boosts contract for chain ${chainId}`);
  }
  
  const contract = new ethers.Contract(contractAddress, BOOSTS_ABI, provider);
  const price = await contract.tierPrices(tier);
  return ethers.utils.formatEther(price);
}

export async function getBoostStatus(
  eventId: number, 
  provider: ethers.providers.Provider, 
  chainId: number = 84532
): Promise<{ isBoosted: boolean; endTime: number; tier: number; booster: string }> {
  const contractAddress = CONTRACTS[chainId as keyof typeof CONTRACTS]?.boosts;
  if (!contractAddress) {
    throw new Error(`No boosts contract for chain ${chainId}`);
  }
  
  const contract = new ethers.Contract(contractAddress, BOOSTS_ABI, provider);
  const [isBoosted, endTime, tier, booster] = await contract.getBoostStatus(eventId);
  return { isBoosted, endTime: endTime.toNumber(), tier, booster };
}

export async function getAssertion(
  assertionId: number,
  provider: ethers.providers.Provider,
  chainId: number = 84532
): Promise<{
  eventId: number;
  asserter: string;
  assertionType: number;
  claimHash: string;
  stakeAmount: string;
  challengeDeadline: number;
  status: number;
}> {
  const contractAddress = CONTRACTS[chainId as keyof typeof CONTRACTS]?.assertions;
  if (!contractAddress) {
    throw new Error(`No assertions contract for chain ${chainId}`);
  }
  
  const contract = new ethers.Contract(contractAddress, ASSERTIONS_ABI, provider);
  const [eventId, asserter, assertionType, claimHash, stakeAmount, challengeDeadline, status] = 
    await contract.getAssertion(assertionId);
  
  return {
    eventId: eventId.toNumber(),
    asserter,
    assertionType,
    claimHash,
    stakeAmount: ethers.utils.formatEther(stakeAmount),
    challengeDeadline: challengeDeadline.toNumber(),
    status
  };
}

export async function getChallenge(
  challengeId: number,
  provider: ethers.providers.Provider,
  chainId: number = 84532
): Promise<{
  assertionId: number;
  challenger: string;
  stakeAmount: string;
  counterHash: string;
  resolved: boolean;
}> {
  const contractAddress = CONTRACTS[chainId as keyof typeof CONTRACTS]?.assertions;
  if (!contractAddress) {
    throw new Error(`No assertions contract for chain ${chainId}`);
  }
  
  const contract = new ethers.Contract(contractAddress, ASSERTIONS_ABI, provider);
  const [assertionId, challenger, stakeAmount, counterHash, resolved] = 
    await contract.getChallenge(challengeId);
  
  return {
    assertionId: assertionId.toNumber(),
    challenger,
    stakeAmount: ethers.utils.formatEther(stakeAmount),
    counterHash,
    resolved
  };
}
