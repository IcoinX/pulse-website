import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyMessage } from 'viem';
import { jwtSign } from '@/lib/jwt';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { wallet_address, signature, nonce } = await req.json();

    // Validation
    if (!wallet_address || !signature || !nonce) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const normalizedAddress = wallet_address.toLowerCase();

    // Verify nonce exists and is valid
    const { data: nonceData, error: nonceError } = await supabase
      .from('auth_nonces')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .eq('nonce', nonce)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (nonceError || !nonceData) {
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 401 }
      );
    }

    // Verify signature
    const message = `Sign in to PULSE Protocol\n\nWallet: ${wallet_address}\nNonce: ${nonce}\n\nThis signature proves ownership of your wallet.`;
    
    try {
      const isValid = await verifyMessage({
        address: wallet_address as `0x${string}`,
        message,
        signature: signature as `0x${string}`
      });

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } catch (sigErr) {
      console.error('Signature verification error:', sigErr);
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      );
    }

    // Delete used nonce
    await supabase
      .from('auth_nonces')
      .delete()
      .eq('id', nonceData.id);

    // Create or update user
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        wallet_address: normalizedAddress,
        last_seen_at: new Date().toISOString()
      }, {
        onConflict: 'wallet_address',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Generate JWT
    const token = await jwtSign({
      userId: user.id,
      wallet: normalizedAddress
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        wallet_address: user.wallet_address
      }
    });

  } catch (err) {
    console.error('Auth verify error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
