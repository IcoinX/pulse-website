import { SignJWT, jwtVerify as joseJwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

export interface JWTPayload {
  userId: string;
  wallet: string;
}

export async function jwtSign(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function jwtVerify(token: string): Promise<JWTPayload> {
  const { payload } = await joseJwtVerify(token, JWT_SECRET);
  return payload as unknown as JWTPayload;
}
