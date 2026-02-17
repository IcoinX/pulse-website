export function logBoostAttempt(params: {
  address: string;
  whitelisted: boolean;
  eventId: number;
  tier: number;
  success: boolean;
  error?: string;
}) {
  // Log to console for now, can be sent to analytics service later
  console.log('[BOOST]', {
    timestamp: new Date().toISOString(),
    ...params
  });
  
  // Could also send to Supabase for tracking
  // supabase.from('boost_attempts').insert(params)
}
