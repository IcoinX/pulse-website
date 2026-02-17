import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Generate nonce for wallet signature
export async function POST(req: NextRequest) {
  try {
    const { wallet_address } = await req.json();
    
    if (!wallet_address || !/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Generate random nonce
    const nonce = randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store nonce
    const { error } = await supabase
      .from('auth_nonces')
      .insert({
        wallet_address: wallet_address.toLowerCase(),
        nonce,
        expires_at: expires_at.toISOString()
      });

    if (error) {
      console.error('Nonce storage error:', error);
      return NextResponse.json(
        { error: 'Failed to generate nonce' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      nonce,
      expires_at: expires_at.toISOString()
    });

  } catch (err) {
    console.error('Nonce generation error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
