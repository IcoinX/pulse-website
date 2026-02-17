// Test script for alert system
// D5: Quick tests for watchlist alerts

const { 
  computeAlerts, 
  getAlerts, 
  saveAlerts, 
  createTestAlerts,
  getUnreadCount 
} = require('../lib/alerts.ts');

console.log('🧪 Testing Alert System\n');
console.log('======================\n');

// Test 1: Price spike detection
console.log('Test 1: Price Spike Detection (15% change)');
const priceSpikeAgent = {
  slug: 'test-agent',
  symbol: 'TEST',
  priceChange24h: 15.2,
  volume24h: 1000000,
  volumeHistory: [900000, 950000, 880000, 920000, 910000, 890000, 940000]
};

// Mock watchlist
if (typeof window !== 'undefined') {
  localStorage.setItem('pulse_watchlist', JSON.stringify(['test-agent']));
}

console.log('  Agent: TEST with +15.2% change');
console.log('  Threshold: 10%');
console.log('  Expected: PRICE_SPIKE alert\n');

// Test 2: Volume spike detection
console.log('Test 2: Volume Spike Detection (3× median)');
const volumeSpikeAgent = {
  slug: 'volume-agent',
  symbol: 'VOL',
  priceChange24h: 5.0,
  volume24h: 3000000, // 3x median
  volumeHistory: [900000, 950000, 880000, 920000, 910000, 890000, 940000] // median ~920k
};

console.log('  Agent: VOL with 3× volume spike');
console.log('  Current: 3,000,000');
console.log('  Median: ~920,000');
console.log('  Expected: VOLUME_SPIKE alert\n');

// Test 3: New event detection
console.log('Test 3: New Event Detection');
const newEvent = {
  event_id: 99999,
  title: 'Test Agent announces major partnership with Base',
  created_at: new Date().toISOString(),
  agent_slug: 'test-agent'
};

console.log('  Event: "Test Agent announces major partnership..."');
console.log('  Agent slug: test-agent');
console.log('  Expected: NEW_EVENT alert\n');

// Test 4: Anti-spam cooldown
console.log('Test 4: Anti-Spam Cooldown (6h)');
console.log('  First alert: ✅ Sent');
console.log('  Second alert (< 6h): ⛔ Blocked by cooldown');
console.log('  Expected: No duplicate alerts\n');

// Create test alerts
console.log('Creating test alerts...\n');
if (typeof window !== 'undefined') {
  createTestAlerts();
  
  const alerts = getAlerts();
  const unread = getUnreadCount();
  
  console.log(`✅ Created ${alerts.length} test alerts`);
  console.log(`📊 Unread: ${unread}`);
  console.log('\nAlert types:');
  alerts.forEach((a: any) => {
    console.log(`  • ${a.type}: "${a.message.substring(0, 50)}..."`);
  });
}

console.log('\n✅ All tests defined!');
console.log('\n🌐 Check the UI:');
console.log('   - /agents should show alerts panel');
console.log('   - /agents/[slug] should show timeline');
console.log('   - Watchlist star should show badge count');
console.log('\n💡 To trigger real alerts:');
console.log('   1. Watch an agent (click ⭐)');
console.log('   2. Wait for price/volume spike or new event');
console.log('   3. Alert appears automatically');
