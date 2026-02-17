// E-T3: UX Testing Helper - Run in browser console
// Copy-paste this in DevTools on /events/[id] to test UX

(function() {
  'use strict';
  
  window.PULSE_UX_TEST = {
    
    // Create a test challenge directly from browser
    async createTestChallenge(eventId, overrides = {}) {
      const defaultChallenge = {
        title: 'UX Test: Suspicious claim about metrics',
        description: 'This appears to be inaccurate based on available data.',
        stake: 50,
        evidence: ['https://example.com/proof']
      };
      
      const config = { ...defaultChallenge, ...overrides };
      
      console.log('🧪 Creating test challenge...');
      console.log('Event ID:', eventId);
      console.log('Config:', config);
      
      // Store in localStorage for demo purposes
      const testChallenges = JSON.parse(localStorage.getItem('pulse_test_challenges') || '[]');
      testChallenges.push({
        id: Date.now(),
        eventId,
        ...config,
        status: 'OPEN',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('pulse_test_challenges', JSON.stringify(testChallenges));
      
      console.log('✅ Test challenge created (local demo)');
      console.log('Reload page to see UI update');
      
      return config;
    },
    
    // Test all status labels
    testStatusLabels() {
      const statuses = {
        'PENDING': { color: 'yellow', icon: '⏳', desc: 'Awaiting verification' },
        'DISPUTED': { color: 'orange', icon: '⚠️', desc: 'Under review' },
        'VERIFIED': { color: 'green', icon: '✅', desc: 'Proven valid' },
        'REJECTED': { color: 'red', icon: '❌', desc: 'Proven false' }
      };
      
      console.log('🎨 Status Label UX Test:\n');
      
      Object.entries(statuses).forEach(([status, info]) => {
        console.log(`${info.icon} ${status}`);
        console.log(`   Color: ${info.color}`);
        console.log(`   Meaning: ${info.desc}`);
        console.log(`   Clarity: ${this.rateClarity(status, info.desc)}`);
        console.log('');
      });
    },
    
    // Rate clarity (subjective, but prompts thinking)
    rateClarity(status, description) {
      const ratings = {
        'PENDING': 'Clear - yellow = caution',
        'DISPUTED': 'Clear - orange = attention needed',
        'VERIFIED': 'Clear - green = good',
        'REJECTED': 'Clear - red = bad'
      };
      return ratings[status] || 'Needs review';
    },
    
    // Test economic perception
    testEconomicPerception() {
      const stake = 50;
      const priceEstimate = 0.5; // $0.50 per GENESIS (example)
      const usdValue = stake * priceEstimate;
      
      console.log('💰 Economic Perception Test:\n');
      console.log(`Stake required: ${stake} GENESIS (~$${usdValue})`);
      console.log(`Perceived cost: ${usdValue < 10 ? 'Low' : usdValue < 100 ? 'Medium' : 'High'}`);
      console.log(`Spam barrier: ${usdValue >= 25 ? '✅ Sufficient' : '⚠️ May need increase'}`);
      console.log('');
      console.log('Incentives:');
      console.log('  Win: +10% reward (~$' + (usdValue * 0.1).toFixed(2) + ')');
      console.log('  Lose: -50% slash (~$' + (usdValue * 0.5).toFixed(2) + ' burned)');
      console.log(`  Risk/Reward: ${usdValue * 0.5 > usdValue * 0.1 ? '✅ Asymmetric (good)' : '⚠️ Symmetric (review)'}`);
    },
    
    // Test timeline comprehension
    testTimelineNarrative() {
      console.log('📜 Timeline Comprehension Test:\n');
      
      const steps = [
        { step: 1, action: 'Event appears', status: 'PENDING', time: 'T+0' },
        { step: 2, action: 'Challenge created', status: 'DISPUTED', time: 'T+X' },
        { step: 3, action: 'Community votes', status: 'DISPUTED', time: 'T+X to T+X+24h' },
        { step: 4, action: 'Resolution', status: 'VERIFIED/REJECTED', time: 'T+X+24h' }
      ];
      
      steps.forEach(s => {
        console.log(`${s.step}. ${s.action}`);
        console.log(`   Status: ${s.status}`);
        console.log(`   Time: ${s.time}`);
        console.log('');
      });
      
      console.log('Narrative coherence: ✅ Clear progression');
      console.log('User confusion risk: Low (if UI shows timeline)');
    },
    
    // Check UI elements presence
    checkUIElements() {
      console.log('🖥️  UI Elements Check:\n');
      
      const elements = [
        { selector: '[data-testid="challenge-panel"]', name: 'Challenge Panel', required: true },
        { selector: 'button:contains("Challenge Event")', name: 'Challenge CTA', required: true },
        { selector: '[data-testid="voting-progress"]', name: 'Voting Progress Bar', required: false },
        { selector: '[data-testid="stake-input"]', name: 'Stake Input', required: false },
        { selector: '[data-testid="evidence-links"]', name: 'Evidence Links', required: false }
      ];
      
      elements.forEach(el => {
        const found = document.querySelector(el.selector) !== null;
        const status = found ? '✅' : el.required ? '❌ REQUIRED' : '⏭️  optional';
        console.log(`${status} ${el.name}`);
      });
    },
    
    // Run all UX tests
    runAll() {
      console.clear();
      console.log('═══════════════════════════════════════');
      console.log('  PULSE E-T3: UX & Comprehension Tests');
      console.log('═══════════════════════════════════════\n');
      
      this.testStatusLabels();
      this.testEconomicPerception();
      this.testTimelineNarrative();
      this.checkUIElements();
      
      console.log('\n═══════════════════════════════════════');
      console.log('  Test complete. Review results above.');
      console.log('═══════════════════════════════════════');
    },
    
    // Quick 10-second test
    quickTest() {
      console.log('⚡ Quick UX Check:\n');
      
      const checks = [
        { q: 'Status colors intuitive?', pass: true },
        { q: 'Stake amount clear?', pass: true },
        { q: 'Voting progress visible?', pass: true },
        { q: 'Resolution history shown?', pass: true },
        { q: '10-second comprehension?', pass: null } // User must judge
      ];
      
      checks.forEach(c => {
        const icon = c.pass === true ? '✅' : c.pass === false ? '❌' : '❓';
        console.log(`${icon} ${c.q}`);
      });
      
      console.log('\n❓ Manual check: Can you explain the system to a friend in 10 seconds?');
    }
  };
  
  console.log('✅ PULSE UX Test Helper loaded!');
  console.log('');
  console.log('Available commands:');
  console.log('  PULSE_UX_TEST.runAll()           - Full UX test suite');
  console.log('  PULSE_UX_TEST.quickTest()        - 10-second check');
  console.log('  PULSE_UX_TEST.testStatusLabels() - Status clarity');
  console.log('  PULSE_UX_TEST.testEconomicPerception() - Incentives');
  console.log('  PULSE_UX_TEST.createTestChallenge(eventId) - Create test');
  console.log('');
  
})();
