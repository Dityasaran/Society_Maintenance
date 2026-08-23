import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
);
const COOKIE_NAME = 'smt_token';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'RESIDENT' | 'ADMIN';
  name: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new jose.SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'RESIDENT' | 'ADMIN',
      name: payload.name as string,
    };
  } catch (err) {
    console.error('JWT VERIFICATION ERROR:', err);
    return null;
  }
}

export { COOKIE_NAME };
