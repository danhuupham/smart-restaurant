import jwt from 'jsonwebtoken';

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const verifyToken = (token: string): DecodedToken | null => {
  try {
    const secret = process.env.JWT_SECRET || 'super-secret';
    return jwt.verify(token, secret) as DecodedToken;
  } catch (error) {
    return null;
  }
};

export const getUserRole = (token: string): string | null => {
  const decoded = verifyToken(token);
  return decoded ? decoded.role : null;
};